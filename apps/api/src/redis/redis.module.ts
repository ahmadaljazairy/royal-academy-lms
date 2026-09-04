import {Global, Logger, Module} from '@nestjs/common';
import {Redis} from 'ioredis';
import {REDIS_CLIENT} from './redis.constants.js';
import {RedisService} from './redis.service.js';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async () => {
                const logger = new Logger('RedisModule');
                const host = process.env.REDIS_HOST ?? '127.0.0.1';
                const port = Number(process.env.REDIS_PORT ?? 6379);

                const redis = new Redis({
                    host,
                    port,
                    lazyConnect: true, // Prevents automatic background connection
                    maxRetriesPerRequest: 1,
                    enableOfflineQueue: false, // Prevents commands from queuing indefinitely when Redis is down
                    retryStrategy(times) {
                        // If it has retried 5 times without success, stop retrying
                        if (times > 5) {
                            return null;
                        }
                        // Exponential backoff: min(times * 100ms, 3000ms) with jitter
                        return Math.min(times * 100, 3000);
                    }
                });

                redis.on('error', (err) => {
                    logger.error('Redis connection error:', err.message);
                });

                try {
                    // Explicitly await connection during NestJS bootstrap
                    await redis.connect();
                    logger.log(`Successfully connected to Redis instance at ${host}:${port}`);
                } catch (error) {
                    logger.error(`Failed to connect to Redis on ${host}:${port}. Halting boot.`);
                    // Disconnect the client to shut down background reconnect loops before crashing
                    redis.disconnect();
                    throw error; // Crashing boot prevents starting a broken authentication system
                }

                return redis;
            },
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}