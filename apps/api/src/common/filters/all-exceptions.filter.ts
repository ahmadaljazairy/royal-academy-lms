import {
    type ExceptionFilter,
    Catch,
    type ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// Shared Monorepo Contracts
import type { ApiErrorResponse, UserSession } from '@template/types';

/**
 * Global exception filter that catches all unhandled rejections, HTTP exceptions,
 * and ORM/database constraints, transforming them into a unified flat error envelope:
 * `ApiErrorResponse`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request & { id?: string; user?: UserSession }>();

        // -------------------------------------------------------------------------
        // 1. Guard against pre-committed streams / headers
        // -------------------------------------------------------------------------
        if (response.headersSent) {
            this.logger.warn(
                `Headers already sent for ${request.method} ${request.url}. Skipping exception envelope.`,
            );
            return;
        }

        // -------------------------------------------------------------------------
        // 2. Correlation & Distributed Trace ID Continuity
        // -------------------------------------------------------------------------
        const traceId =
            request.id ||
            (request.headers['x-trace-id'] as string) ||
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string) ||
            randomUUID();

        // Ensure request and response share the exact trace identifier
        request.id = traceId;
        response.setHeader('x-trace-id', traceId);

        const isProduction = process.env.NODE_ENV === 'production';

        // -------------------------------------------------------------------------
        // 3. Resolve Status Code, Error Type, and Message
        // -------------------------------------------------------------------------
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorType = 'InternalServerError';
        let stack: string | undefined = undefined;

        if (exception instanceof HttpException) {
            // Path 1: Managed NestJS HTTP Exceptions
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
                errorType = exception.constructor.name;
            } else if (typeof res === 'object' && res !== null) {
                const resObj = res as Record<string, unknown>;
                message = (resObj.message as string | string[]) || exception.message;
                // Prefer explicit class name (e.g. 'BadRequestException') over 'Bad Request'
                errorType = exception.constructor.name || (resObj.error as string);
            }
            stack = exception.stack;
        } else if (this.isDatabaseConstraintError(exception)) {
            // Path 2: ORM Unique Key Collisions (Prisma P2002, Postgres 23505)
            status = HttpStatus.CONFLICT;
            errorType = 'ConflictException';
            message = 'A resource with these details already exists.';
            stack = (exception as Error).stack;
        } else if (this.isDatabaseNotFoundError(exception)) {
            // Path 3: ORM Record Not Found (Prisma P2025)
            status = HttpStatus.NOT_FOUND;
            errorType = 'NotFoundException';
            message = 'The requested resource was not found.';
            stack = (exception as Error).stack;
        } else if (exception instanceof Error) {
            // Path 4: Standard System / Runtime Errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorType = exception.name || 'InternalServerError';
            message = isProduction
                ? 'An unexpected error occurred. Please contact support.'
                : exception.message;
            stack = exception.stack;
        } else {
            // Path 5: Non-Error Primitive Throws (e.g., throw "string")
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorType = 'UnhandledPrimitiveException';
            message = isProduction ? 'An unexpected error occurred.' : String(exception);
        }

        // -------------------------------------------------------------------------
        // 4. Resolve Context & Identity for Structured Logging
        // -------------------------------------------------------------------------
        // UserSession stores `userId`, not `id`
        const userId =
            request.user?.userId ||
            (request.user as unknown as { id?: string })?.id ||
            'anonymous';

        // Support reverse proxies for client IP
        const clientIp =
            (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            request.ip;

        const errorLog = {
            traceId,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            clientIp,
            userAgent: request.get('user-agent'),
            userId,
            errorMessage: message,
            errorType,
        };

        const formattedMessage =
            typeof message === 'string' ? message : JSON.stringify(message);

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `[${traceId}] ${request.method} ${request.url} - ${status} - ${errorType}: ${formattedMessage}`,
                stack,
            );
            this.logger.debug(`Context: ${JSON.stringify(errorLog)}`);
        } else {
            this.logger.warn(
                `[${traceId}] ${request.method} ${request.url} - ${status} - ${errorType}: ${formattedMessage} [User: ${userId}]`,
            );
        }

        // -------------------------------------------------------------------------
        // 5. Assemble Flat Response Envelope (ApiErrorResponse)
        // -------------------------------------------------------------------------
        const errorPayload: ApiErrorResponse = {
            success: false,
            statusCode: status,
            error: errorType,
            message,
            data: null,
            traceId,
            timestamp: new Date().toISOString(),
            ...(isProduction || !stack ? {} : { debugStack: stack }),
        };

        response.status(status).json(errorPayload);
    }

    /**
     * Identifies common SQL/ORM unique constraint collisions:
     * - Prisma: P2002
     * - PostgreSQL: 23505
     * - MongoDB: 11000
     */
    private isDatabaseConstraintError(exception: unknown): boolean {
        if (!exception || typeof exception !== 'object') return false;

        const err = exception as Record<string, unknown>;
        return err.code === 'P2002' || err.code === '23505' || err.code === 11000;
    }

    /**
     * Identifies common SQL/ORM record-not-found errors:
     * - Prisma: P2025 (An operation failed because it depends on one or more records that were required but not found)
     */
    private isDatabaseNotFoundError(exception: unknown): boolean {
        if (!exception || typeof exception !== 'object') return false;

        const err = exception as Record<string, unknown>;
        return err.code === 'P2025';
    }
}