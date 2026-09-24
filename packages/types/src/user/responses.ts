/**
 * @file User Response Wire Contracts
 * @module @template/types/user/responses
 * @description Outbound serialized payloads returned inside ApiSuccessResponse<T>.
 */

import type { Role } from './models.js';
import type { PresignedPostUploadResponse } from '../storage/index.js';

/**
 * Private, comprehensive user profile representation.
 * Returned exclusively to the authenticated account owner or system administrators.
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
 * Sanitized public profile representation.
 * Consumed by directories, course cards, and public portfolio views.
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
 * Response payload returned after confirming an avatar upload.
 */
export interface ConfirmAvatarUploadResponse {
    avatarUrl: string;
}

/**
 * Confirmation payload for completed password rotation.
 */
export interface ChangePasswordResponse {
    message: string;
}

/**
 * Alias for avatar upload presigned ticket response.
 */
export type AvatarUploadTicketResponse = PresignedPostUploadResponse;