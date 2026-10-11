/**
 * @file Dual-Bucket Sliding-Window Rate Limit Guard
 * @module @royal-academy/api/common/guards/rate-limit/rate-limit.guard
 */

import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    HttpException, HttpStatus,
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import type {Request, Response} from 'express';
import {
    RATE_LIMIT_KEY,
    type RateLimitOptions,
} from '../../decorators/rate-limit.decorator.js';
import {RateLimitCacheRepository} from './cache/index.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rateLimitCache: RateLimitCacheRepository,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const options = this.reflector.getAllAndOverride<RateLimitOptions>(
            RATE_LIMIT_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!options) {
            return true;
        }

        const http = context.switchToHttp();
        const req = http.getRequest<Request>();
        const res = http.getResponse<Response>();

        const clientIp = this.extractClientIp(req);
        const prefix = options.keyPrefix || 'global';

        // -------------------------------------------------------------------------
        // Bucket 1: IP Bucket (Volumetric Guard)
        // -------------------------------------------------------------------------
        const ipResult = await this.rateLimitCache.evaluateSlidingWindow(
            `${prefix}:ip`,
            req.path,
            clientIp,
            options.limit,
            options.ttlSeconds,
        );

        if (ipResult) {
            res.setHeader('X-RateLimit-Limit', options.limit);
            res.setHeader('X-RateLimit-Remaining', ipResult.remaining);
            res.setHeader('X-RateLimit-Reset', ipResult.resetTimestamp);

            if (ipResult.isExceeded) {
                res.setHeader('Retry-After', options.ttlSeconds);
                throw new HttpException(
                    `Too many requests from this IP. Please try again in ${options.ttlSeconds} seconds.`,
                    HttpStatus.TOO_MANY_REQUESTS);
            }
        }

        // -------------------------------------------------------------------------
        // Bucket 2: Target Identifier Bucket (Account / Spray Protection)
        // -------------------------------------------------------------------------
        if (options.keyResolver) {
            const rawTarget = options.keyResolver(req);

            if (rawTarget && rawTarget.trim().length > 0) {
                const targetIdentifier = rawTarget.trim().toLowerCase();

                // Developer controls the target limit explicitly, falling back to options.limit
                const targetLimit = options.targetLimit ?? options.limit;

                const targetResult = await this.rateLimitCache.evaluateSlidingWindow(
                    `${prefix}:target`,
                    req.path,
                    targetIdentifier,
                    targetLimit,
                    options.ttlSeconds,
                );

                if (targetResult?.isExceeded) {
                    res.setHeader('Retry-After', options.ttlSeconds);
                    throw new HttpException(
                        `Too many requests from this IP. Please try again in ${options.ttlSeconds} seconds.`,
                        HttpStatus.TOO_MANY_REQUESTS);
                }
            }
        }

        return true;
    }

    /**
     * Safely extracts client IP address and sanitizes IPv6 delimiters.
     */
    private extractClientIp(req: Request): string {
        const rawIp =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.ip ||
            req.socket.remoteAddress ||
            'unknown';

        return rawIp.replace(/[:\s]/g, '_');
    }
}