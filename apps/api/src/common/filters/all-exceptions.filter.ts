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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // 1. Establish or extract correlation ID for request tracing
        const traceId =
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string) ||
            randomUUID();

        response.setHeader('x-trace-id', traceId);

        const isProduction = process.env.NODE_ENV === 'production';

        // 2. Resolve Status Code, Message, and Error Classification
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
            } else if (typeof res === 'object' && res !== null) {
                const resObj = res as Record<string, unknown>;
                message = (resObj.message as string | string[]) || exception.message;
                errorType = (resObj.error as string) || exception.name;
            }
            stack = exception.stack;
        } else if (this.isDatabaseConstraintError(exception)) {
            // Path 2: ORM / Database Constraint Violations (e.g., Duplicate Key)
            status = HttpStatus.CONFLICT;
            errorType = 'ConflictException';
            message = 'A resource with these details already exists.';
            stack = (exception as Error).stack;
        } else if (exception instanceof Error) {
            // Path 3: Standard Unhandled System Errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorType = exception.name;
            // In production, mask raw developer messages for 500s
            message = isProduction ? 'An unexpected error occurred. Please contact support.' : exception.message;
            stack = exception.stack;
        } else {
            // Path 4: Edge Case - Non-Error primitives (e.g. throw "string")
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorType = 'UnhandledPrimitiveException';
            message = isProduction ? 'An unexpected error occurred.' : String(exception);
        }

        const appReq = request as Request & {
            user?: { id?: string };
            session?: { userId?: string };
        };
        const userId = appReq.user?.id || appReq.session?.userId || 'anonymous';

        // 3. Structured Server-Side Logging
        const errorLog = {
            traceId,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            clientIp: request.ip,
            userAgent: request.get('user-agent'),
            userId: userId,
            errorMessage: message,
            errorType,
        };

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `[${traceId}] ${request.method} ${request.url} - ${status} - Error: ${JSON.stringify(message)}`,
                stack,
            );
            this.logger.debug(`Context: ${JSON.stringify(errorLog)}`);
        } else {
            this.logger.warn(
                `[${traceId}] ${request.method} ${request.url} - ${status} - Warning: ${JSON.stringify(message)}`,
            );
        }

        // 4. Send Consistent Client Response
        response.status(status).json({
            success: false,
            data: null,
            message,
            error: errorType,
            statusCode: status,
            traceId,
            timestamp: new Date().toISOString(),
            ...(isProduction ? {} : { debugStack: stack }), // Include stack trace ONLY in local dev
        });
    }

    /**
     * Identifies common SQL/ORM unique constraint collisions
     * (e.g. Postgres 23505, MySQL ER_DUP_ENTRY, Prisma P2002, Mongo 11000)
     */
    private isDatabaseConstraintError(exception: unknown): boolean {
        if (!exception || typeof exception !== 'object') return false;

        const err = exception as Record<string, unknown>;
        // Prisma Unique Constraint
        if (err.code === 'P2002') return true;
        // Postgres Unique Violation
        if (err.code === '23505') return true;
        // MongoDB Duplicate Key
        if (err.code === 11000) return true;

        return false;
    }
}