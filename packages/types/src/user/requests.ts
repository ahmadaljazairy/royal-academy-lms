/**
 * @file User Request DTO Contracts
 * @module @template/types/user/requests
 * @description Inbound payload shapes sent from clients to user management endpoints.
 */

/**
 * Client request payload for updating profile metadata.
 * Partial fields support HTTP PATCH semantics.
 */
export interface UpdateProfileRequest {
    /** Updated public display name. */
    displayName?: string;

    /** Short professional headline or academic focus (max 120 chars). */
    headline?: string;

    /** Extended Markdown-compatible biography or portfolio summary. */
    bio?: string;

    /** Contact phone number in standardized format. */
    phoneNumber?: string;

    /** Fully qualified personal portfolio or organization website URL. */
    websiteUrl?: string;

    /** Public GitHub profile URL or handle. */
    githubUrl?: string;

    /** Public LinkedIn profile URL. */
    linkedinUrl?: string;
}

/**
 * Request payload to initiate an avatar direct-upload sequence.
 */
export interface RequestAvatarUploadRequest {
    /**
     * MIME type of the avatar image asset.
     * Supported: `image/jpeg`, `image/png`, `image/webp`.
     */
    mimeType: string;

    /** Original filename on the client device for audit logging. */
    originalFilename?: string;
}

/**
 * Request payload to finalize and commit an avatar upload.
 */
export interface ConfirmAvatarUploadRequest {
    /** Unique storage object key returned during upload ticket creation. */
    fileKey: string;
}

/**
 * Request payload for self-service password changes.
 */
export interface ChangePasswordRequest {
    /** Current plaintext password for credential re-verification. */
    currentPassword: string;

    /** New plaintext password meeting complexity rules. */
    newPassword: string;
}