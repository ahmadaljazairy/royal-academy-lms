/**
 * @file Storage Response Contracts
 * @module @template/types/storage/responses
 */

/**
 * Pre-signed POST direct-upload ticket payload returned to clients.
 */
export interface PresignedPostUploadResponse {
    /** Target bucket endpoint where the multipart form upload must be submitted. */
    uploadUrl: string;

    /** Form fields and policy signatures (policy, x-amz-signature, etc.). */
    fields: Record<string, string>;

    /** Storage object key where the uploaded file will reside. */
    fileKey: string;

    /** Destination storage bucket name. */
    bucket: string;

    /** Window of validity for the presigned signature (in seconds). */
    expiresInSeconds: number;
}

/**
 * Response payload containing a time-limited pre-signed GET download URL.
 */
export interface PresignedDownloadResponse {
    /** Authenticated temporary read URL. */
    downloadUrl: string;

    /** Validity duration in seconds. */
    expiresInSeconds: number;
}