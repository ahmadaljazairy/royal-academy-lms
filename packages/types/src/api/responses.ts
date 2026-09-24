/**
 * @file API Wire Envelopes
 * @module @template/types/api/responses
 * @description Standardized HTTP envelopes returned across all endpoints.
 */

import type { PaginationMeta } from './models.js';

/**
 * Standard HTTP success envelope returned by `TransformResponseInterceptor`.
 *
 * @template T - The payload shape enclosed within `data`.
 * @template M - The metadata object shape (defaults to a generic dictionary).
 */
export interface ApiSuccessResponse<T, M = Record<string, unknown>> {
    /** Discriminator confirming the request succeeded. */
    success: true;

    /** HTTP response status code (e.g., 200, 201, 204). */
    statusCode: number;

    /** Human-readable status description or confirmation message. */
    message: string;

    /** The primary serialized domain entity or payload. */
    data: T;

    /** Unique distributed trace or correlation ID for end-to-end request tracing. */
    traceId: string;

    /** ISO 8601 formatted timestamp of when the response was serialized. */
    timestamp: string;

    /** Optional context-specific metadata (e.g., pagination, performance timers). */
    meta?: M;
}

/**
 * Standard HTTP error envelope returned by `AllExceptionsFilter`.
 */
export interface ApiErrorResponse {
    /** Discriminator confirming the operation failed. */
    success: false;

    /** HTTP error status code (e.g., 400, 401, 403, 404, 500). */
    statusCode: number;

    /** High-level HTTP error title or category (e.g., 'Not Found', 'Unauthorized'). */
    error: string;

    /** Descriptive failure explanation or array of validation errors. */
    message: string | string[];

    /** Explicitly nullified to maintain consistent JSON structural symmetry on error states. */
    data: null;

    /** Correlation trace ID matching server audit logs for incident reporting. */
    traceId: string;

    /** ISO 8601 formatted timestamp of when the error occurred. */
    timestamp: string;

    /**
     * Diagnostic stack trace.
     * Stripped automatically in production environments.
     */
    debugStack?: string;
}

/**
 * Discriminated union of platform HTTP responses.
 */
export type ApiResponse<T, M = Record<string, unknown>> =
    | ApiSuccessResponse<T, M>
    | ApiErrorResponse;

/**
 * Convenience alias for paginated collection responses.
 */
export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[], PaginationMeta>;