/**
 * @file Authentication Request Contracts
 * @module @template/types/auth/requests
 * @description Inbound payloads sent from clients to authentication endpoints.
 */

/**
 * Client request payload for self-service user registration.
 */
export interface RegisterRequest {
    /** Valid email format required for authentication. */
    email: string;

    /** Raw plaintext password meeting platform complexity requirements. */
    password: string;

    /** Public display name or real name. */
    displayName: string;

    /** Explicit legal acknowledgment of the Terms of Service and Privacy Policy. */
    termsAccepted: boolean;
}

/** Backward-compatible alias for existing code. */
export type RegisterInput = RegisterRequest;

/**
 * Client request payload for session authentication.
 */
export interface LoginRequest {
    /** Registered user email address. */
    email: string;

    /** Account password. */
    password: string;

    /**
     * Extends the session TTL (e.g., 30 days vs standard 24-hour session).
     * @default false
     */
    rememberMe?: boolean;
}

/** Backward-compatible alias for existing code. */
export type LoginInput = LoginRequest;