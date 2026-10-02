/**
 * @file Session Cache Contracts
 * @module @template/api/modules/auth/cache/session-cache.contracts
 */

import { defineRedisContract } from '../../../common/redis/redis.contract.js';
import type { UserSession } from '@template/types';

/**
 * Helper to safely parse environment variable hours into TTL seconds.
 */
function parseEnvHoursToSeconds(
    envValue: string | undefined,
    fallbackSeconds: number,
): number {
    if (!envValue) return fallbackSeconds;
    const parsedHours = Number(envValue);
    return Number.isNaN(parsedHours) ? fallbackSeconds : parsedHours * 60 * 60;
}

export const SESSION_TTL = {
    /** Standard session TTL: 24 Hours (86,400 seconds) */
    STANDARD: parseEnvHoursToSeconds(process.env.SESSION_STANDARD_TTL_HOURS, 60 * 60 * 24 ),

    /** Extended "Remember Me" session TTL: 30 Days (2,592,000 seconds) */
    REMEMBER_ME: parseEnvHoursToSeconds(process.env.SESSION_STANDARD_TTL_HOURS, 60 * 60 * 24 * 30 ),
} as const;

export const SESSION_CACHE_CONTRACTS = {
    /**
     * Stateful user session payload stored in Redis.
     * Key Pattern: auth:session:v1:<sessionId>
     */
    session: defineRedisContract<[sessionId: string], UserSession>({
        namespace: 'auth:session',
        ttl: SESSION_TTL.STANDARD, // Fallback default
        key: (sessionId) => `auth:session:v1:${sessionId}`,
    }),
} as const;