/**
 * @file Storage Request Contracts
 * @module @template/types/storage/requests
 */

import type { StorageScope } from './models.js';

/**
 * Client request payload to generate an S3-compatible pre-signed direct upload ticket.
 */
export interface PresignedPostUploadRequest {
    /** Target storage partition governing bucket path and byte quotas. */
    scope: StorageScope;

    /** MIME type used to enforce Content-Type restrictions on the storage policy. */
    mimeType: string;

    /** Original filename for auditing and extension preservation. */
    originalFilename?: string;
}