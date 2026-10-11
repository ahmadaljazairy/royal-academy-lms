/**
 * @file Rate Limiting Route Decorator
 * @module @royal-academy/api/common/guards/rate-limit/rate-limit.decorator
 * @description Attaches sliding-window rate limiting configuration metadata to controllers or handlers.
 */

import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import type { Request } from 'express';

export const RATE_LIMIT_KEY = 'RATE_LIMIT_METADATA';

export interface RateLimitOptions {
    /** Maximum allowed requests for the IP bucket within the rolling window */
    readonly limit: number;

    /** Rolling window duration in seconds */
    readonly ttlSeconds: number;

    /** Custom bucket namespace (e.g., 'auth:login') */
    readonly keyPrefix?: string;

    /**
     * Optional custom resolver to extract a target identifier (e.g., email, account ID).
     * Activates Bucket 2 rate limiting when it returns a non-empty string.
     */
    readonly keyResolver?: (req: Request) => string | undefined | null;

    /**
     * Optional explicit limit for Bucket 2 (Target Bucket).
     * Defaults to `limit` if not provided.
     */
    readonly targetLimit?: number;
}

/**
 * Decorator enforcing sliding-window rate limiting.
 *
 * @example
 * ```typescript
 * // Shorthand: 10 requests per 60 seconds (IP-only bucket)
 * @RateLimit(10, 60)
 *
 * // Dual-bucket usage: IP bucket + Account Target bucket
 * @RateLimit({
 *   limit: 5,
 *   ttlSeconds: 60,
 *   keyPrefix: 'auth:login',
 *   keyResolver: (req) => req.body?.email,
 * })
 * ```
 */
export function RateLimit(
    optionsOrLimit: RateLimitOptions | number,
    ttlSeconds?: number,
): CustomDecorator<string> {
    const options: RateLimitOptions =
        typeof optionsOrLimit === 'number'
            ? {
                limit: optionsOrLimit,
                ttlSeconds: ttlSeconds ?? 60,
            }
            : optionsOrLimit;

    return SetMetadata(RATE_LIMIT_KEY, options);
}