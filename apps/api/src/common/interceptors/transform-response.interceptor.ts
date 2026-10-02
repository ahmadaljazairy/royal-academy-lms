/**
 * @file Global Response Transformation Interceptor
 * @module @template/api/common/interceptors/transform-response.interceptor
 * @description Intercepts successful controller returns and constructs standardized
 * `ApiSuccessResponse<T>` or `ApiPaginatedResponse<T>` wire envelopes.
 */

import {
    Injectable,
    type NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

// Shared Monorepo Envelopes
import type { ApiSuccessResponse } from '@template/types';

// Custom Decorator Metadata Keys
import {
    RESPONSE_MESSAGE_KEY,
    BYPASS_TRANSFORM_KEY,
} from '../decorators/response.decorators.js';

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
        // 2. Resolve, Sanitize (CRLF Defense), and Inject Trace ID
        // -------------------------------------------------------------------------
        const rawTraceId =
            (request.headers['x-trace-id'] as string) ||
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string) ||
            request.id;

        // Strip carriage returns and newlines to prevent HTTP Response Splitting
        const sanitizedTraceId = rawTraceId
            ? rawTraceId.replace(/[\r\n]/g, '').trim()
            : undefined;

        const traceId = sanitizedTraceId || randomUUID();

        // Attach trace ID to request for audit logging and set outgoing header
        request.id = traceId;
        response.setHeader('x-trace-id', traceId);

        // -------------------------------------------------------------------------
        // 3. Resolve Custom Message via @ResponseMessage(...)
        // -------------------------------------------------------------------------
        const customMessage = this.reflector.getAllAndOverride<string>(
            RESPONSE_MESSAGE_KEY,
            [context.getHandler(), context.getClass()],
        );

        return next.handle().pipe(
            map((result: unknown): ApiSuccessResponse<T> | T => {
                // ---------------------------------------------------------------------
                // 4. Bypass Binary Streams, Buffers, & Pre-committed Responses
                // ---------------------------------------------------------------------
                if (
                    response.headersSent ||
                    result instanceof StreamableFile ||
                    Buffer.isBuffer(result)
                ) {
                    return result as T;
                }

                // ---------------------------------------------------------------------
                // 5. Unpack Paginated Data Structures into { data, meta }
                // ---------------------------------------------------------------------
                let data = result;
                let meta: Record<string, unknown> | undefined = undefined;

                if (result && typeof result === 'object' && !Array.isArray(result)) {
                    const resObj = result as Record<string, unknown>;

                    // Standard shape returned by pagination services: { items: [...], meta: PaginationMeta }
                    if ('items' in resObj && 'meta' in resObj) {
                        data = resObj.items;
                        meta = resObj.meta as Record<string, unknown>;
                    }
                    // Alternative flat pagination shape: { items: [...], total, page, ... }
                    else if (
                        'items' in resObj &&
                        ('total' in resObj || 'page' in resObj || 'limit' in resObj)
                    ) {
                        const { items, ...restMeta } = resObj;
                        data = items;
                        meta = restMeta;
                    }
                }

                // ---------------------------------------------------------------------
                // 6. Synchronize Status Codes
                // ---------------------------------------------------------------------
                const httpCodeOverride = this.reflector.get<number>(
                    HTTP_CODE_METADATA,
                    context.getHandler(),
                );

                const defaultMethodStatus = request.method === 'POST' ? 201 : 200;
                const statusCode =
                    httpCodeOverride ?? (response.statusCode || defaultMethodStatus);

                response.statusCode = statusCode;

                const defaultMessage =
                    statusCode === 201 ? 'Resource created successfully' : 'Success';

                // ---------------------------------------------------------------------
                // 7. Construct Final ApiSuccessResponse / ApiPaginatedResponse Envelope
                // ---------------------------------------------------------------------
                const envelope: ApiSuccessResponse<T> = {
                    success: true,
                    statusCode,
                    message: customMessage || defaultMessage,
                    data: (data ?? null) as T,
                    traceId,
                    timestamp: new Date().toISOString(),
                    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
                };

                return envelope;
            }),
        );
    }
}