export type StorageScope =
    | 'AVATAR'
    | 'COURSE_THUMBNAIL'
    | 'COURSE_VIDEO'
    | 'COURSE_ATTACHMENT';

export interface PresignedPostUploadRequest {
    scope: StorageScope;
    mimeType: string;
    originalFilename?: string;
}

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

export interface VerifiedStorageObject {
    fileKey: string;
    publicUrl: string;
    sizeBytes: number;
    mimeType: string;
}