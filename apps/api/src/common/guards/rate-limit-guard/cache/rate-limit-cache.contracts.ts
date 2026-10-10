/**
 * @file Rate Limiting Cache Contracts
 * @module @template/api/common/guards/rate-limit/rate-limit-cache.contracts
 */

import {
    defineRedisContract,
    sanitizeKeySegment,
} from '../../../redis/redis.contract.js';

export const RATE_LIMIT_CACHE_CONTRACTS = {
    /**
     * Sliding window tracker using Redis Sorted Sets (ZSET).
     * Generates: "rl:window:v1:<bucketPrefix>:<sanitizedPath>:<identifier>"
     * bucketPrefix : <keyPrefix>:bucketName (e.g. auth:login:ip )
     */
    slidingWindow: defineRedisContract<
        [bucketPrefix: string, path: string, identifier: string],
        void
    >({
        namespace: 'rl:window',
        version: 1,
        ttl: 60,
        key: (bucketPrefix, path, identifier) =>
            `${bucketPrefix}:${sanitizeKeySegment(path)}:${identifier}`,
    }),
} as const;