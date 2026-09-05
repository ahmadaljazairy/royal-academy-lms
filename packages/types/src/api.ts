export interface ApiResponse<TData = unknown> {
    success: boolean;
    statusCode: number;
    message: string | string[];
    data: TData | null;
    error?: string;
    meta?: Record<string, unknown>;
    traceId: string;
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    itemCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
    items: T[];
    meta: PaginationMeta;
}