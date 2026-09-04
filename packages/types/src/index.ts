export * from './user.js';
export * from './auth.js';

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
 * Standard system health status contract.
 */
export interface HealthStatus {
    status: 'ok' | 'error' | 'maintenance';
    uptime: number;
    version: string;
}
