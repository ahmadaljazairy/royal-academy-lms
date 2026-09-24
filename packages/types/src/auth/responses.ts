/**
 * @file Authentication Response Contracts
 * @module @template/types/auth/responses
 * @description Outbound payloads returned from authentication endpoints.
 */

import type { AuthUser } from '../user/models.js';

/**
 * Standard HTTP response returned after successful authentication operations (login, register, me).
 */
export type AuthUserResponse = AuthUser;

/**
 * Response payload returned upon successful session termination.
 */
export interface LogoutResponse {
    /** Confirms whether the server session was invalidated successfully. */
    loggedOut: boolean;
}

/** Backward-compatible alias for existing code. */
export type LogoutResult = LogoutResponse;