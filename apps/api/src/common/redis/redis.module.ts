/**
 * @file Global Redis Provider Module
 * @module @template/api/common/redis/redis.module
 * @description Configures and bootstraps the persistent `ioredis` client pool.
 *
 * Production Hardening:
 * 1. Safe URL / Standalone Parser: Supports full `REDIS_URL` connection strings
 *    (including credentials/TLS) as well as fallback `REDIS_HOST` / `REDIS_PORT`.
 * 2. Credential Redaction: Strips sensitive passwords before printing connection logs.
 * 3. Thundering-Herd Backoff: Exponential retry strategy incorporates randomized jitter.
 * 4. Memory Defense: `enableOfflineQueue: false` prevents unbounded memory growth
 *    if Redis goes offline while the HTTP server is serving high-throughput traffic.
 */

import { Global, Logger, Module } from '@nestjs/common';
import { Redis, type RedisOptions } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants.js';
import { RedisService } from './redis.service.js';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async (): Promise<Redis> => {
                const logger = new Logger('RedisModule');

                const redisUrl = process.env.REDIS_URL;
                const host = process.env.REDIS_HOST ?? '127.0.0.1';
                const port = Number(process.env.REDIS_PORT ?? 6379);
                const password = process.env.REDIS_PASSWORD || undefined;
                const isTls = process.env.REDIS_TLS === 'true';

                const clientOptions: RedisOptions = {
                    lazyConnect: true,
                    maxRetriesPerRequest: 3,
                    enableOfflineQueue: false, // Drop commands immediately if offline to protect Node event loop memory
                    connectTimeout: 10000,
                    retryStrategy(times: number) {
                        if (times > 10) {
                            logger.error('Redis retry attempts exhausted (>10). Aborting reconnect.');
                            return null;
                        }
                        // Exponential backoff with 50-200ms jitter to prevent thundering herd
                        const jitter = Math.floor(Math.random() * 150) + 50;
                        const delay = Math.min(times * 200, 3000) + jitter;
                        return delay;
                    },
                    reconnectOnError(err) {
                        const targetError = 'READONLY';
                        if (err.message.includes(targetError)) {
                            // Reconnect when a primary/replica failover occurs
                            return true;
                        }
                        return false;
                    },
                };

                let redis: Redis;

                if (redisUrl) {
                    redis = new Redis(redisUrl, clientOptions);
                } else {
                    redis = new Redis({
                        ...clientOptions,
                        host,
                        port,
                        password,
                        tls: isTls ? {} : undefined,
                    });
                }

                // Mask credentials in connection logs
                const sanitizedTarget = redisUrl
                    ? redisUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@')
                    : `${host}:${port}`;

                redis.on('error', (err: Error) => {
                    logger.error(`Redis client runtime error [${sanitizedTarget}]: ${err.message}`);
                });

                redis.on('reconnecting', () => {
                    logger.warn(`Redis client attempting to reconnect to ${sanitizedTarget}...`);
                });

                try {
                    await redis.connect();
                    logger.log(`Successfully connected to Redis instance at ${sanitizedTarget}`);
                } catch (error) {
                    logger.error(`Failed to connect to Redis on ${sanitizedTarget}. Halting boot.`);
                    redis.disconnect();
                    throw error;
                }

                return redis;
            },
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}