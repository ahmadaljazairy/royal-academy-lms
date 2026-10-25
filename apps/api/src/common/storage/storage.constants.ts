/**
 * @file Storage Module Constants & Scope Specifications
 * @module @royal-academy/api/common/storage/storage.constants
 * @description Centralized configuration for S3/MinIO bucket defaults, presigned TTLs,
 * and scope specifications (MIME types, byte quotas, and path prefixes).
 */

import type { StorageScope } from '@royal-academy/types';

export interface StorageScopeSpec {
    readonly isPublic: boolean;
    readonly allowedMimeTypes: readonly string[];
    readonly maxSizeBytes: number;
    readonly pathPrefix: string;
}

export const STORAGE_DEFAULTS = {
    ENDPOINT: 'http://127.0.0.1:9000',
    REGION: 'us-east-1',
    PUBLIC_BUCKET: 'royal-academy-public',
    PRIVATE_BUCKET: 'royal-academy-private',
    PRESIGNED_UPLOAD_TTL_SECONDS: 900, // 15 Minutes
    PRESIGNED_DOWNLOAD_TTL_SECONDS: 3600, // 1 Hour
} as const;

export const STORAGE_SCOPES: Record<StorageScope, StorageScopeSpec> = {
    AVATAR: {
        isPublic: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 5 * 1024 * 1024, // 5 MB
        pathPrefix: 'avatars',
    },
    COURSE_THUMBNAIL: {
        isPublic: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 10 * 1024 * 1024, // 10 MB
        pathPrefix: 'courses/thumbnails',
    },
    COURSE_VIDEO: {
        isPublic: false,
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        maxSizeBytes: 2 * 1024 * 1024 * 1024, // 2 GB
        pathPrefix: 'courses/videos',
    },
    COURSE_ATTACHMENT: {
        isPublic: false,
        allowedMimeTypes: [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'text/plain',
            'image/jpeg',
            'image/png',
        ],
        maxSizeBytes: 50 * 1024 * 1024, // 50 MB
        pathPrefix: 'courses/attachments',
    },
} as const;