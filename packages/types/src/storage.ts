export type StorageScope =
    | 'AVATAR'
    | 'COURSE_THUMBNAIL'
    | 'COURSE_VIDEO'
    | 'COURSE_ATTACHMENT';

/**
 * Payload sent by the client to request a presigned POST ticket.
 */
export interface PresignedPostUploadRequest {
    scope: StorageScope;
    mimeType: string;
    originalFilename?: string;
}

/**
 * Presigned POST ticket containing the S3 endpoint and all required form fields.
 */
export interface PresignedPostUploadResponse {
    uploadUrl: string;
    fields: Record<string, string>;
    fileKey: string;
    bucket: string;
    expiresInSeconds: number;
}

export interface PresignedDownloadResponse {
    downloadUrl: string;
    expiresInSeconds: number;
}

export interface ConfirmAvatarUploadDto {
    fileKey: string;
}

export interface VerifiedStorageObject {
    fileKey: string;
    publicUrl: string;
    sizeBytes: number;
    mimeType: string;
}