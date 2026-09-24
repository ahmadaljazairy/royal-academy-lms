/**
 * @file User Domain Models & Core Types
 * @module @template/types/user/models
 */

/**
 * System authorization roles mirroring the database schema.
 */
export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

/**
 * Runtime list of system roles for validation guards and iteration.
 */
export const ROLES: readonly Role[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'] as const;

/**
 * Public, sanitized identity representation.
 * Excludes sensitive credentials such as password hashes.
 */
export interface AuthUser {
    /** Unique user identifier (CUID). */
    id: string;

    /** Primary verified or pending email address. */
    email: string;

    /** Full display name shown across platform surfaces. */
    displayName: string;

    /** System authorization role. */
    role: Role;

    /** Verification flag confirming email ownership. */
    isEmailVerified: boolean;
}

/**
 * Backward-compatible alias for AuthUser.
 * @deprecated Prefer `AuthUser` to avoid confusion with profile metadata models.
 */
export type UserProfile = AuthUser;