/**
 * @file Global Exception Handling Filter
 * @module @royal-academy/api/common/filters/all-exceptions.filter
 * @description Catches all unhandled HTTP exceptions, ORM/database constraints,
 * and system errors across the application, transforming them into a unified flat
 * error envelope: `ApiErrorResponse`.
 *
 * Capabilities & Security Hardening:
 * 1. CRLF / Header Injection Defense: Sanitizes incoming client trace IDs against newline characters.
 * 2. Information Disclosure Prevention: Obfuscates raw internal 500 error details in production.
 * 3. Validation Array Preservation: Passes class-validator error array strings through cleanly.
 * 4. ORM & Database Constraint Mapping: Maps Prisma / SQL unique constraint collisions (P2002) to 409 Conflict
 *    and missing record errors (P2025) to 404 Not Found.
 * 5. Pre-Committed Stream Safety: Prevents writing JSON error envelopes if response headers are already sent.
 */

import {
    type ExceptionFilter,
    Catch,
    type ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

// Shared Monorepo Contracts
import type {ApiErrorResponse, UserSession} from '@royal-academy/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<
            Request & { id?: string; user?: UserSession }
        >();

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
        // 2. Resolve, Sanitize (CRLF Defense), and Inject Trace ID
        // -------------------------------------------------------------------------
        const rawTraceId =
            request.id ||
            (request.headers['x-trace-id'] as string) ||
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-correlation-id'] as string);

        // Security Hardening: Strip CRLF characters (\r, \n) to prevent HTTP Response Splitting
        const sanitizedTraceId = rawTraceId
            ? rawTraceId.replace(/[\r\n]/g, '').trim()
            : undefined;

        const traceId = sanitizedTraceId || randomUUID();

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
            // Path 1: Managed NestJS HTTP Exceptions (BadRequestException, NotFoundException, etc.)
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
                errorType = exception.constructor.name;
            } else if (typeof res === 'object' && res !== null) {
                const resObj = res as Record<string, unknown>;
                message = (resObj.message as string | string[]) || exception.message;
                errorType = exception.constructor.name || (resObj.error as string);
            }
            stack = exception.stack;
        } else if (this.isDatabaseConstraintError(exception)) {
            // Path 2: ORM Unique Key Collisions (Prisma P2002, Postgres 23505, Mongo 11000)
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
            // Path 4: Standard System / Uncaught Runtime Errors
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
            message = isProduction
                ? 'An unexpected error occurred.'
                : String(exception);
        }

        // -------------------------------------------------------------------------
        // 4. Sanitize 500-Level Messages in Production
        // -------------------------------------------------------------------------
        if (isProduction && status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            message = 'An unexpected error occurred. Please contact support.';
        }

        // -------------------------------------------------------------------------
        // 5. Resolve Context & Identity for Structured Logging
        // -------------------------------------------------------------------------
        const userId = request.user?.userId || 'anonymous';

        const clientIp =
            (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            request.ip ||
            'unknown';

        const errorLog = {
            traceId,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            clientIp,
            userAgent: request.get('user-agent'),
            userId,
            errorType,
            errorMessage: message,
        };

        const formattedMessage = Array.isArray(message)
            ? message.join(', ')
            : message;

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `[${traceId}] ${request.method} ${request.url} - ${status} ${errorType}: ${formattedMessage}`,
                stack,
            );
            this.logger.debug(`Context: ${JSON.stringify(errorLog)}`);
        } else {
            this.logger.warn(
                `[${traceId}] ${request.method} ${request.url} - ${status} ${errorType}: ${formattedMessage} [User: ${userId}]`,
            );
        }

        // -------------------------------------------------------------------------
        // 6. Assemble Flat Response Envelope (ApiErrorResponse)
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
        return (
            err.code === 'P2002' || err.code === '23505' || err.code === 11000
        );
    }

    /**
     * Identifies common SQL/ORM record-not-found errors:
     * - Prisma: P2025 (Record to update/delete not found)
     */
    private isDatabaseNotFoundError(exception: unknown): boolean {
        if (!exception || typeof exception !== 'object') return false;

        const err = exception as Record<string, unknown>;
        return err.code === 'P2025';
    }
}