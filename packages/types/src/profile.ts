import type { Role } from './user.js';
import type {PresignedPostUploadResponse} from "./storage.js";

// ==========================================
// REQUEST PAYLOADS (Implemented by API DTOs)
// ==========================================

export interface UpdateProfileRequest {
    displayName?: string;
    headline?: string;
    bio?: string;
    phoneNumber?: string;
    websiteUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
}

export interface RequestAvatarUploadRequest {
    mimeType: string;
    originalFilename?: string;
}

export interface ConfirmAvatarUploadRequest {
    fileKey: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// ==========================================
// RESPONSE PAYLOADS (Returned inside ApiResponse<T>)
// ==========================================

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

export interface ConfirmAvatarUploadResponse {
    avatarUrl: string;
}

export interface ChangePasswordResponse {
    message: string;
}

// Re-export storage ticket response for profile avatar usage convenience
export type AvatarUploadTicketResponse = PresignedPostUploadResponse;