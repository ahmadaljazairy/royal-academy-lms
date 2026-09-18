import type { Role } from './user.js';

/**
 * Full private user profile payload returned to the authenticated owner.
 */
export interface UserProfileResponse {
    userId: string;
    email: string;
    displayName: string;
    role: Role;
    isEmailVerified: boolean;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    websiteUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Restricted profile payload safe for public visibility (students/instructors viewing each other).
 */
export interface PublicProfileResponse {
    userId: string;
    displayName: string;
    role: Role;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
}

/**
 * Metadata response when requesting a presigned avatar upload URL.
 */
export interface PresignedAvatarUploadResponse {
    uploadUrl: string;
    fileKey: string;
    expiresInSeconds: number;
}