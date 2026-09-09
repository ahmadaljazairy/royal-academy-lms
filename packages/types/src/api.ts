/**
 * Standard flat success envelope returned by TransformResponseInterceptor
 */
export interface ApiSuccessResponse<T> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    traceId: string;
    timestamp: string;
    meta?: Record<string, unknown>;
}

/**
 * Standard flat error envelope returned by AllExceptionsFilter
 */
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    error: string;
    message: string | string[];
    data: null;
    traceId: string;
    timestamp: string;
    debugStack?: string;
}

/**
 * Discriminated union for API HTTP responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard pagination metadata when meta is present
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}