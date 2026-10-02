/**
 * @file Session Cache Repository
 * @module @template/api/modules/auth/repositories/session-cache.repository
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service.js';
import type { UserSession } from '@template/types';

import {
    SESSION_CACHE_CONTRACTS,
} from './session-cache.contracts.js';

@Injectable()
export class SessionCacheRepository {
    constructor(private readonly redis: RedisService) {}

    async getSession(sessionId: string): Promise<UserSession | null> {
        return this.redis.get(SESSION_CACHE_CONTRACTS.session, sessionId);
    }

}