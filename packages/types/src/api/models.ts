/**
 * @file API Metadata Models
 * @module @template/types/api/models
 * @description Shared foundational metadata shapes used across API envelopes.
 */

/**
 * Standard pagination metadata supplied when listing collection resources.
 */
export interface PaginationMeta {
    /** Current 1-based page index. */
    page: number;

    /** Maximum number of records requested per page. */
    limit: number;

    /** Total count of records matching the query criteria across the entire dataset. */
    totalItems: number;

    /** Total number of pages calculated as `Math.ceil(totalItems / limit)`. */
    totalPages: number;

    /** Indicates whether a subsequent page of records exists. */
    hasNextPage: boolean;

    /** Indicates whether an antecedent page of records exists. */
    hasPreviousPage: boolean;
}

/**
 * Sort direction for collection queries.
 */
export type SortOrder = 'asc' | 'desc';