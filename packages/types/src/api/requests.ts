/**
 * @file API Common Request Contracts
 * @module @template/types/api/requests
 * @description Reusable query parameters and request structures for API endpoints.
 */

import type { SortOrder } from './models.js';

/**
 * Standard query parameters for paginated list endpoints.
 * Consumed by query DTOs and URL query string parsers.
 */
export interface PaginationQuery {
    /**
     * 1-based page number to retrieve.
     * @default 1
     */
    page?: number;

    /**
     * Maximum records to retrieve per page.
     * @default 10
     */
    limit?: number;

    /** Property/column name to sort results by. */
    sortBy?: string;

    /**
     * Sort direction.
     * @default 'desc'
     */
    sortOrder?: SortOrder;
}