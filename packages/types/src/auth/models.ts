/**
 * @file Authentication Models & Session State
 * @module @template/types/auth/models
 * @description Internal state structures stored in Redis and attached to authenticated sessions.
 */

import type { Role } from '../user/models.js';

/**
 * Stateful session payload stored in Redis and bound to an HTTP session cookie.
 * Contains minimal identity data required to authenticate incoming requests without a database hit.
 */
export interface UserSession {
    /** Owning user identifier (CUID). */
    userId: string;

    /** Primary user email address. */
    email: string;

    /** Access control tier for immediate guard-level evaluation. */
    role: Role;

    /** Epoch timestamp in milliseconds indicating when the session was initialized. */
    createdAt: number;

    /** Cached verification status to quickly guard email-restricted routes. */
    isEmailVerified: boolean;
}