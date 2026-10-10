/**
 * @file Rate Limit Cache Repository
 * @module @template/api/common/guards/rate-limit/rate-limit-cache.repository
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service.js';
import { RATE_LIMIT_CACHE_CONTRACTS } from './rate-limit-cache.contracts.js';

export interface RateLimitResult {
    readonly currentHits: number;
    readonly remaining: number;
    readonly resetTimestamp: number;
    readonly isExceeded: boolean;
}

@Injectable()
export class RateLimitCacheRepository {
    private readonly logger = new Logger(RateLimitCacheRepository.name);

    constructor(private readonly redis: RedisService) {}

    /**
     * Evaluates sliding window rate limits atomically using Redis Sorted Sets.
     */
    async evaluateSlidingWindow(
        bucketPrefix: string,
        path: string,
        identifier: string,
        limit: number,
        ttlSeconds: number,
    ): Promise<RateLimitResult | null> {
        try {
            const redisKey = RATE_LIMIT_CACHE_CONTRACTS.slidingWindow.key(
                bucketPrefix,
                path,
                identifier,
            );
            const now = Date.now();
            const windowStart = now - ttlSeconds * 1000;

            // Pipeline execution prevents race conditions across high-throughput clusters
            const pipeline = this.redis.raw.pipeline();
            pipeline.zremrangebyscore(redisKey, 0, windowStart);
            pipeline.zcard(redisKey);
            pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
            pipeline.expire(redisKey, ttlSeconds);

            const results = await pipeline.exec();

            if (!results) {
                return null;
            }

            const zcardEntry = results[1];
            const currentHits =
                typeof zcardEntry?.[1] === 'number' ? zcardEntry[1] : 0;
            const remaining = Math.max(0, limit - (currentHits + 1));
            const resetTimestamp = Math.ceil((now + ttlSeconds * 1000) / 1000);

            return {
                currentHits,
                remaining,
                resetTimestamp,
                isExceeded: currentHits >= limit,
            };
        } catch (error) {
            // Fail-open: Log failure and return null to prevent API downtime on Redis outage
            this.logger.error(
                `Rate limit evaluation failed for bucket "${bucketPrefix}" at path "${path}"`,
                error instanceof Error ? error.stack : undefined,
            );
            return null;
        }
    }
}