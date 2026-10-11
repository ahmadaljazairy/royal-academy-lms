/**
 * @file Rate Limit Guard Module
 * @module @royal-academy/api/common/guards/rate-limit-guard/rate-limit.module
 */

import { Global, Module } from '@nestjs/common';
import { RateLimitCacheRepository } from './cache/index.js';
import { RateLimitGuard } from './rate-limit.guard.js';

@Global()
@Module({
    providers: [RateLimitCacheRepository, RateLimitGuard],
    exports: [RateLimitCacheRepository, RateLimitGuard],
})
export class RateLimitGuardModule {}