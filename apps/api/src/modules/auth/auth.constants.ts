/**
 * @file Authentication Constants
 * @module @royal-academy/api/modules/auth/auth-constants
 * @description Defines session-cookie names and secure cookie configuration.
 */

import type { CookieOptions } from 'express';

/**
 * Name of the HTTP cookie containing the opaque session identifier.
 *
 * @remarks
 * The cookie contains only the random session ID. It must not contain user
 * details, authorization roles, or other session payload data.
 */
export const SESSION_COOKIE_NAME = 'sid';

/**
 * Base security attributes shared across session cookie operations.
 */
function getBaseSessionCookieOptions(): Omit<CookieOptions, 'maxAge'> {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };
}

/**
 * Creates secure options for setting the authentication session cookie.
 *
 * @param maxAgeMs - Cookie lifetime in milliseconds. Matches the Redis session
 * lifetime selected by the authentication workflow.
 * @returns Express cookie options for the session identifier.
 * @throws {RangeError} When `maxAgeMs` is not a positive, finite integer.
 */
export function getSessionCookieOptions(maxAgeMs: number): CookieOptions {
    if (!Number.isSafeInteger(maxAgeMs) || maxAgeMs <= 0) {
        throw new RangeError(
            'Session cookie lifetime must be a positive integer.',
        );
    }

    return {
        ...getBaseSessionCookieOptions(),
        maxAge: maxAgeMs,
    };
}

/**
 * Creates matching cookie options used when clearing the session cookie on logout.
 */
export function getClearSessionCookieOptions(): CookieOptions {
    return getBaseSessionCookieOptions();
}