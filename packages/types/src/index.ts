/**
 * Generic API response envelope for all HTTP endpoints.
 */
export interface ApiResponse<TData = unknown> {
    success: boolean;
    data: TData;
    message?: string;
    timestamp: string;
}

/**
 * Standard paginated collection envelope.
 */
export interface PaginatedResult<TItem> {
    items: TItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

/**
 * Common base entity contract.
 */
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Standard system health status contract.
 */
export interface HealthStatus {
    status: 'ok' | 'error' | 'maintenance';
    uptime: number;
    version: string;
}