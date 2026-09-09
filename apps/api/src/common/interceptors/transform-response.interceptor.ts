import {
    Injectable,
    type NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// Shared Monorepo Contracts
import type { ApiSuccessResponse } from '@template/types';

// Cross-cutting Decorator Constants
import {
    RESPONSE_MESSAGE_KEY,
    BYPASS_TRANSFORM_KEY,
} from '../decorators/response.decorators.js';

/**
 * Global response interceptor that wraps outgoing controller payloads into
 * the standardized flat envelope: `ApiSuccessResponse<T>`.
 *
 * Capabilities:
 * - Bypasses transformation if marked with `@BypassTransform()`.
 * - Bypasses binary payloads (StreamableFile, Buffer) and already-sent streams.
 * - Extracts pagination structures (`items` and `meta`).
 * - Injects and tracks distributed trace IDs across request and response headers.
 * - Synchronizes NestJS `@HttpCode()` overrides with the envelope's `statusCode`.
 */
@Injectable()
export class TransformResponseInterceptor<T>
    implements NestInterceptor<T, ApiSuccessResponse<T> | T>
{
    constructor(private readonly reflector: Reflector = new Reflector()) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ApiSuccessResponse<T> | T> {
        // -------------------------------------------------------------------------
        // 1. Check for explicit bypass via @BypassTransform()
        // -------------------------------------------------------------------------
        const shouldBypass = this.reflector.getAllAndOverride<boolean>(
            BYPASS_TRANSFORM_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (shouldBypass) {
            return next.handle();
        }

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request & { id?: string }>();
        const response = httpContext.getResponse<Response>();

        // -------------------------------------------------------------------------
        // 2. Resolve or generate correlation / trace ID
        // -------------------------------------------------------------------------
        const incomingTraceId =
            (request.headers['x-trace-id'] as string) ||
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string) ||
            request.id;

        const traceId = incomingTraceId || randomUUID();

        // Attach trace ID to request for downstream filters and set outgoing header
        request.id = traceId;
        response.setHeader('x-trace-id', traceId);

        // -------------------------------------------------------------------------
        // 3. Resolve custom message from @ResponseMessage(...)
        // -------------------------------------------------------------------------
        const customMessage = this.reflector.getAllAndOverride<string>(
            RESPONSE_MESSAGE_KEY,
            [context.getHandler(), context.getClass()],
        );

        return next.handle().pipe(
            map((result: unknown): ApiSuccessResponse<T> | T => {
                // ---------------------------------------------------------------------
                // 4. Handle Streams, Buffers, and Pre-committed Responses
                // ---------------------------------------------------------------------
                if (
                    response.headersSent ||
                    result instanceof StreamableFile ||
                    Buffer.isBuffer(result)
                ) {
                    return result as T;
                }

                // ---------------------------------------------------------------------
                // 5. Normalization for Paginated Domain Results
                // ---------------------------------------------------------------------
                let data = result;
                let meta: Record<string, unknown> | undefined = undefined;

                if (result && typeof result === 'object' && !Array.isArray(result)) {
                    const resObj = result as Record<string, unknown>;

                    // Case A: Standard { items: [...], meta: { ... } }
                    if ('items' in resObj && 'meta' in resObj) {
                        data = resObj.items;
                        meta = resObj.meta as Record<string, unknown>;
                    }
                    // Case B: Flatter pagination { items: [...], total, page, ... }
                    else if ('items' in resObj && ('total' in resObj || 'page' in resObj)) {
                        const { items, ...restMeta } = resObj;
                        data = items;
                        meta = restMeta;
                    }
                }

                // ---------------------------------------------------------------------
                // 6. Compute and Synchronize HTTP Status Code
                // ---------------------------------------------------------------------
                const httpCodeOverride = this.reflector.get<number>(
                    '__httpCode__',
                    context.getHandler(),
                );

                // Fallback: If POST with no explicit @HttpCode, Nest defaults to 201
                const defaultMethodStatus = request.method === 'POST' ? 201 : 200;
                const statusCode =
                    httpCodeOverride ?? (response.statusCode || defaultMethodStatus);

                // Ensure Express wire status matches envelope statusCode
                response.statusCode = statusCode;

                const defaultMessage =
                    statusCode === 201 ? 'Resource created successfully' : 'Success';

                // ---------------------------------------------------------------------
                // 7. Assemble Flat Envelope (ApiSuccessResponse<T>)
                // ---------------------------------------------------------------------
                const envelope: ApiSuccessResponse<T> = {
                    success: true,
                    statusCode,
                    message: customMessage || defaultMessage,
                    data: (data as T) ?? (null as unknown as T),
                    traceId,
                    timestamp: new Date().toISOString(),
                    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
                };

                return envelope;
            }),
        );
    }
}