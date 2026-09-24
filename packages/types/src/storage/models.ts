/**
 * @file Storage Domain Models & Scopes
 * @module @template/types/storage/models
 */

/**
 * Storage isolation partitions.
 * Governs asset directory paths, byte quotas, and bucket access policies:
 * - `AVATAR`: Public images, max 2MB.
 * - `COURSE_THUMBNAIL`: Public course banner images, max 5MB.
 * - `COURSE_VIDEO`: Private video streams, authenticated playback.
 * - `COURSE_ATTACHMENT`: Supplementary resources (PDFs, code archives).
 */
export type StorageScope =
    | 'AVATAR'
    | 'COURSE_THUMBNAIL'
    | 'COURSE_VIDEO'
    | 'COURSE_ATTACHMENT';

/**
 * Runtime constant array of valid storage scopes.
 */
export const STORAGE_SCOPES: readonly StorageScope[] = [
    'AVATAR',
    'COURSE_THUMBNAIL',
    'COURSE_VIDEO',
    'COURSE_ATTACHMENT',
] as const;

/**
 * Metadata retrieved from object storage after performing a `headObject` verification.
 * Confirms an asset exists and meets bounds before storing references in PostgreSQL.
 */
export interface VerifiedStorageObject {
    /** Object path inside the target bucket. */
    fileKey: string;

    /** Fully qualified public CDN or internal URI. */
    publicUrl: string;

    /** Physical byte size of the binary payload. */
    sizeBytes: number;

    /** Standardized MIME type confirmed by the storage provider. */
    mimeType: string;
}