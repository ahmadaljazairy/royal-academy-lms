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
import {
    RESPONSE_MESSAGE_KEY,
    BYPASS_TRANSFORM_KEY,
} from '../decorators/response.decorators.js';
import type {ApiResponse} from "@template/types";
@Injectable()
export class TransformResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T> | T>
{
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ApiResponse<T> | T> {
        // 1. Check if route is marked with @BypassTransform()
        const shouldBypass = this.reflector.getAllAndOverride<boolean>(
            BYPASS_TRANSFORM_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (shouldBypass) {
            return next.handle();
        }

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        const traceId =
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string) ||
            randomUUID();

        response.setHeader('x-trace-id', traceId);

        const customMessage = this.reflector.getAllAndOverride<string>(
            RESPONSE_MESSAGE_KEY,
            [context.getHandler(), context.getClass()],
        );

        return next.handle().pipe(
            map((result: unknown): ApiResponse<T> | T => {
                if (result instanceof StreamableFile || Buffer.isBuffer(result)) {
                    return result as T;
                }

                let data = result;
                let meta: Record<string, unknown> | undefined = undefined;

                if (result && typeof result === 'object' && !Array.isArray(result)) {
                    const resObj = result as Record<string, unknown>;
                    if ('items' in resObj && 'meta' in resObj) {
                        data = resObj.items;
                        meta = resObj.meta as Record<string, unknown>;
                    } else if ('items' in resObj && ('total' in resObj || 'page' in resObj)) {
                        const { items, ...restMeta } = resObj;
                        data = items;
                        meta = restMeta;
                    }
                }

                const httpCodeOverride = this.reflector.get<number>(
                    '__httpCode__',
                    context.getHandler(),
                );
                const statusCode = httpCodeOverride ?? response.statusCode;
                const defaultMessage =
                    statusCode === 201 ? 'Resource created successfully' : 'Success';

                const envelope: ApiResponse<T> = {
                    success: true,
                    statusCode,
                    message: customMessage || defaultMessage,
                    data: (data as T) ?? null,
                    ...(meta ? { meta } : {}),
                    traceId,
                    timestamp: new Date().toISOString(),
                };

                return envelope;
            }),
        );
    }
}