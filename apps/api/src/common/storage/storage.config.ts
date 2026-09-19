import type { StorageScope } from '@template/types';

export interface StorageScopeSpec {
    isPublic: boolean;
    allowedMimeTypes: readonly string[];
    maxSizeBytes: number;
    pathPrefix: string;
}

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
};