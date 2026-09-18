export * from './user.js';
export * from './auth.js';
export * from './api.js';
export * from './profile.js';

/**
 * Standard system health status contract.
 */
export interface HealthStatus {
    status: 'ok' | 'error' | 'maintenance';
    uptime: number;
    version: string;
}
