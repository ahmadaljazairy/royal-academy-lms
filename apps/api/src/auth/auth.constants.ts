import type { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'sid';

export const getSessionCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    const defaultTtlHours = Number(process.env.SESSION_TTL_HOURS ?? 168);

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/',
        maxAge: defaultTtlHours * 60 * 60 * 1000, // milliseconds
    };
};