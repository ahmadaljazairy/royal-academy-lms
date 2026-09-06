import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'RATE_LIMIT_METADATA';

export interface RateLimitOptions {
    limit: number;       // Maximum allowed hits
    ttlSeconds: number;  // Rolling window duration in seconds
    keyPrefix?: string;  // Custom Redis key namespace
    trackEmail?: boolean; // Whether to factor request.body.email into the bucket
}

export const RateLimit = (options: RateLimitOptions) =>
    SetMetadata(RATE_LIMIT_KEY, options);