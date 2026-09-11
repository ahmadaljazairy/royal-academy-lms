import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RATE_LIMIT_KEY, type RateLimitOptions } from '../decorators/rate-limit.decorator.js';
import  {RedisService} from "../redis/redis.service.js";

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly redisService: RedisService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const options = this.reflector.getAllAndOverride<RateLimitOptions>(
            RATE_LIMIT_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no @RateLimit decorator is present, allow the request
        if (!options) {
            return true;
        }

        const http = context.switchToHttp();
        const req = http.getRequest<Request>();
        const res = http.getResponse<Response>();

        const ip =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.ip ||
            req.socket.remoteAddress ||
            'unknown';

        const sanitizedIp = ip.replace(/:/g, '_');

        // Form composite key (ip + sanitized email when configured)
        let identifier = sanitizedIp;
        if (options.trackEmail && typeof req.body?.email === 'string') {
            const sanitizedEmail = req.body.email.trim().toLowerCase();
            identifier = `${sanitizedIp}:${sanitizedEmail}`;
        }

        const prefix = options.keyPrefix || 'rl';
        const redisKey = `${prefix}:${req.path}:${identifier}`;

        const now = Date.now();
        const windowStart = now - options.ttlSeconds * 1000;
        const client = this.redisService.getClient();

        // Atomic sliding window pipeline via Redis Sorted Sets
        const multi = client.multi();
        multi.zremrangebyscore(redisKey, 0, windowStart); // Evict hits outside sliding window
        multi.zcard(redisKey);                           // Count current hits in window
        multi.zadd(redisKey, now, `${now}-${Math.random()}`); // Record current hit
        multi.expire(redisKey, options.ttlSeconds);      // Refresh TTL

        const results = await multi.exec();

        if (!results) {
            return true; // Fail open to avoid taking down API if Redis execution hiccups
        }

        // zcard result is the second command (index 1)
        const zcardEntry = results[1];
        const currentHits = typeof zcardEntry?.[1] === 'number' ? zcardEntry[1] : 0;        const remaining = Math.max(0, options.limit - (currentHits + 1));
        const resetTimestamp = Math.ceil((now + options.ttlSeconds * 1000) / 1000);

        res.setHeader('X-RateLimit-Limit', options.limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', resetTimestamp);

        if (currentHits >= options.limit) {
            res.setHeader('Retry-After', options.ttlSeconds);

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: `Too many requests. Please try again in ${options.ttlSeconds} seconds.`,
                    error: 'Too Many Requests',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }
}