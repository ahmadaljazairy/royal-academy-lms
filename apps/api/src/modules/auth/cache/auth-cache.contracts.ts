/**
 * @file Session Cache Contracts
 * @module @royal-academy/api/modules/auth/cache/session-cache.contracts
 * @description Declares Redis contracts for session storage and user-session indexing.
 */

import { defineRedisContract } from '../../../common/redis/redis.contract.js';
import type { UserSession } from '@royal-academy/types';

/**
 * Safely converts environment variable hours into seconds with fallback defaults.
 */
function parseEnvHoursToSeconds(
    envValue: string | undefined,
    fallbackSeconds: number,
): number {
    if (!envValue) return fallbackSeconds;
    const parsedHours = Number(envValue);
    return Number.isNaN(parsedHours) ? fallbackSeconds : parsedHours * 3600;
}

export const AUTH_TTL = {
    /** Standard session lifespan: 24 Hours */
    SESSION_STANDARD: parseEnvHoursToSeconds(
        process.env.SESSION_STANDARD_TTL_HOURS,
        86400,
    ),
    /** Extended "Remember Me" session lifespan: 30 Days */
    SESSION_REMEMBER_ME: parseEnvHoursToSeconds(
        process.env.SESSION_REMEMBER_ME_TTL_HOURS,
        2592000,
    ),
    /** Email verification token lifespan: 24 Hours */
    VERIFY_TOKEN: parseEnvHoursToSeconds(
        process.env.AUTH_VERIFY_TOKEN_TTL_HOURS,
        86400,
    ),
    /** Password reset token lifespan: 1 Hour */
    RESET_TOKEN: parseEnvHoursToSeconds(
        process.env.AUTH_RESET_TOKEN_TTL_HOURS,
        3600,
    ),
} as const;

export const AUTH_CACHE_CONTRACTS = {
    // ---------------------------------------------------------------------------
    // Session Contracts
    // ---------------------------------------------------------------------------
    /** Stateful session payload -> auth:session:v1:<sessionId> */
    session: defineRedisContract<[sessionId: string], UserSession>({
        namespace: 'auth:session',
        version: 1,
        ttl: AUTH_TTL.SESSION_STANDARD,
        key: (sessionId) => sessionId,
    }),

    /** ZSet active session index -> auth:user:sessions:v1:<userId> */
    userSessions: defineRedisContract<[userId: string], void>({
        namespace: 'auth:user:sessions',
        version: 1,
        ttl: 0, // Managed dynamically
        key: (userId) => userId,
    }),


    // ---------------------------------------------------------------------------
    // Ephemeral Token Contracts
    // ---------------------------------------------------------------------------
    /** Verification token hash -> auth:verify:v1:<tokenHash> */
    emailVerification: defineRedisContract<[tokenHash: string], string>({
        namespace: 'auth:verify',
        version: 1,
        ttl: AUTH_TTL.VERIFY_TOKEN,
        key: (tokenHash) => tokenHash,
    }),

    /** Password reset token hash -> auth:reset:v1:<tokenHash> */
    passwordReset: defineRedisContract<[tokenHash: string], string>({
        namespace: 'auth:reset',
        version: 1,
        ttl: AUTH_TTL.RESET_TOKEN,
        key: (tokenHash) => tokenHash,
    }),
} as const;