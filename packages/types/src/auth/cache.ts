/**
 * @file Auth Cache Payloads & Redis Contracts
 * @module @template/types/auth/cache
 * @description Serialized data structures stored in Redis keys across authentication workflows.
 */

import type { Role } from '../user/models.js';

/**
 * Stateful session payload stored in Redis (key: `auth:session:v1:<sessionId>`)
 * and bound to an HTTP session cookie.
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
