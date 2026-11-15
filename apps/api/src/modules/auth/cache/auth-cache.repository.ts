/**
 * @file Session Cache Repository
 * @module @royal-academy/api/modules/auth/cache/session-cache.repository
 * @description Encapsulates raw Redis pipelines, ZSet index maintenance,
 * atomic lazy pruning, and rolling session expiration logic.
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service.js';
import type { UserSession } from '@royal-academy/types';
import { AUTH_CACHE_CONTRACTS } from './auth-cache.contracts.js';


export type EphemeralTokenType = 'verify' | 'reset';

@Injectable()
export class AuthCacheRepository {
    private readonly logger = new Logger(AuthCacheRepository.name);

    constructor(private readonly redis: RedisService) {}

    /**
     * Retrieves an active user session by session ID using contract deserialization.
     */
    async getSession(sessionId: string): Promise<UserSession | null> {
        return this.redis.get(AUTH_CACHE_CONTRACTS.session, sessionId);
    }

    /**
     * Atomically stores a session payload and indexes it inside the user's ZSet index.
     * Uses NX + GT conditional flags to keep set TTL aligned with the longest session.
     */
    async createSession(
        sessionId: string,
        session: UserSession,
        ttlSeconds: number,
    ): Promise<void> {
        const sessionKey = AUTH_CACHE_CONTRACTS.session.key(sessionId);
        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(session.userId);

        const now = Math.floor(Date.now() / 1000);
        const expireAtEpoch = now + ttlSeconds;

        await this.redis.raw
            .pipeline()
            .set(sessionKey, JSON.stringify(session), 'EX', ttlSeconds)
            .zadd(userSetKey, expireAtEpoch, sessionId)
            .zremrangebyscore(userSetKey, '-inf', now)
            .expire(userSetKey, ttlSeconds, 'NX')
            .expire(userSetKey, ttlSeconds, 'GT')
            .exec();
    }

    /**
     * Refreshes expiration for a session key and updates its score in the user's ZSet index.
     */
    async touchSession(
        sessionId: string,
        userId: string,
        ttlSeconds: number,
    ): Promise<void> {
        const sessionKey = AUTH_CACHE_CONTRACTS.session.key(sessionId);
        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);

        const now = Math.floor(Date.now() / 1000);
        const newExpireAtEpoch = now + ttlSeconds;

        await this.redis.raw
            .pipeline()
            .expire(sessionKey, ttlSeconds)
            .zadd(userSetKey, newExpireAtEpoch, sessionId)
            .expire(userSetKey, ttlSeconds, 'GT')
            .exec();
    }

    /**
     * Destroys a single session key and unlinks it from the user's ZSet index.
     */
    async destroySession(sessionId: string, userId?: string): Promise<boolean> {
        const sessionDeleted = await this.redis.del(
            AUTH_CACHE_CONTRACTS.session,
            sessionId,
        );

        if (userId) {
            const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);
            await this.redis.raw.zrem(userSetKey, sessionId);
        }

        return sessionDeleted > 0;
    }

    /**
     * Fetches non-expired active session IDs for a user.
     * Atomically prunes stale expired sessions in the same pipeline request.
     */
    async getUserSessionIds(userId: string): Promise<string[]> {
        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);
        const now = Math.floor(Date.now() / 1000);

        const pipeline = this.redis.raw.pipeline();
        pipeline.zremrangebyscore(userSetKey, '-inf', now);
        pipeline.zrangebyscore(userSetKey, now, '+inf');

        const results = await pipeline.exec();
        const validSessionIds = results?.[1]?.[1] as string[] | undefined;

        return validSessionIds ?? [];
    }

    /**
     * Revokes specific session keys and removes them from the user's ZSet index.
     */
    async destroySessions(userId: string, sessionIds: string[]): Promise<void> {
        if (!sessionIds.length) return;

        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);
        const pipeline = this.redis.raw.pipeline();

        for (const sid of sessionIds) {
            pipeline.del(AUTH_CACHE_CONTRACTS.session.key(sid));
            pipeline.zrem(userSetKey, sid);
        }

        await pipeline.exec();
    }

    /**
     * Purges all active session keys and deletes the user's ZSet index key.
     */
    async destroyAllUserSessions(userId: string): Promise<number> {
        const sessionIds = await this.getUserSessionIds(userId);
        if (!sessionIds.length) return 0;

        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);
        const pipeline = this.redis.raw.pipeline();

        for (const sid of sessionIds) {
            pipeline.del(AUTH_CACHE_CONTRACTS.session.key(sid));
        }
        pipeline.del(userSetKey);

        await pipeline.exec();
        return sessionIds.length;
    }

    /**
     * Updates user session payloads in-place while retaining individual remaining TTLs.
     */
    async updateUserSessions(
        userId: string,
        partialUpdate: Partial<UserSession>,
    ): Promise<void> {
        const sessionIds = await this.getUserSessionIds(userId);
        if (!sessionIds.length) return;

        const userSetKey = AUTH_CACHE_CONTRACTS.userSessions.key(userId);

        for (const sessionId of sessionIds) {
            const sessionKey = AUTH_CACHE_CONTRACTS.session.key(sessionId);
            const [ttl, session] = await Promise.all([
                this.redis.raw.ttl(sessionKey),
                this.getSession(sessionId),
            ]);

            if (ttl <= 0 || !session) {
                await this.redis.raw.zrem(userSetKey, sessionId);
                continue;
            }

            const updatedSession: UserSession = {
                ...session,
                ...partialUpdate,
            };

            await this.redis.setWithTtl(
                AUTH_CACHE_CONTRACTS.session,
                updatedSession,
                ttl,
                sessionId,
            );
        }
    }

    // ===========================================================================
    // EPHEMERAL TOKEN OPERATIONS
    // ===========================================================================

    /**
     * Resolves the appropriate Redis contract for ephemeral tokens based on token type.
     *
     * @private
     * @param type - Ephemeral token workflow type ('verify' | 'reset')
     * @returns Contract definition targeting either email verification or password reset keys
     */
    private getEphemeralContract(type: EphemeralTokenType) {
        return type === 'verify'
            ? AUTH_CACHE_CONTRACTS.emailVerification
            : AUTH_CACHE_CONTRACTS.passwordReset;
    }

    /**
     * Persists an ephemeral token hash mapped to a user ID in Redis using the contract's default TTL.
     *
     * @description Verification tokens expire in 24 hours (`AUTH_TTL.VERIFY_TOKEN`);
     * password reset tokens expire in 1 hour (`AUTH_TTL.RESET_TOKEN`).
     *
     * @param type - Ephemeral token workflow type ('verify' | 'reset')
     * @param tokenHash - SHA-256 digest of the raw user-facing token
     * @param userId - Target user ID (CUID) associated with the token
     * @returns Promise resolving when the key is successfully set in Redis
     */
    async setEphemeralToken(
        type: EphemeralTokenType,
        tokenHash: string,
        userId: string,
    ): Promise<void> {
        const contract = this.getEphemeralContract(type);
        await this.redis.set(contract, userId, tokenHash);
    }

    /**
     * Atomically fetches and deletes an ephemeral single-use token from Redis.
     *
     * @description Implements atomic single-use semantics to prevent token replay attacks.
     * Attempts primary execution via atomic `GETDEL` (Redis 6.2+). If the command fails or
     * is unsupported by the connected Redis engine, it gracefully falls back to a transaction
     * pipeline (`MULTI` -> `GET` -> `DEL` -> `EXEC`).
     *
     * @param type - Ephemeral token workflow type ('verify' | 'reset')
     * @param tokenHash - SHA-256 digest of the raw user-facing token
     * @returns Promise resolving to the associated `userId` if valid and unconsumed, or `null` if expired or missing
     */
    async consumeEphemeralToken(
        type: EphemeralTokenType,
        tokenHash: string,
    ): Promise<string | null> {
        const contract = this.getEphemeralContract(type);
        const key = contract.key(tokenHash);

        try {
            // Primary Execution: Atomic GETDEL (Redis 6.2+)
            const rawValue = await this.redis.raw.getdel(key);
            return this.deserializeStringValue(rawValue);
        } catch (error) {
            this.logger.warn(
                `Redis GETDEL failed for key "${key}". Falling back to multi/exec pipeline.`,
                error instanceof Error ? error.stack : error,
            );

            // Fallback Execution: Transactional MULTI/EXEC pipeline
            const results = await this.redis.raw
                .multi()
                .get(key)
                .del(key)
                .exec();

            const getResult = results?.[0];
            if (!getResult || getResult[0]) {
                return null;
            }

            return this.deserializeStringValue(
                (getResult[1] as string | null) ?? null,
            );
        }
    }

    /**
     * Unwraps strings serialized via `RedisService.set()` (`JSON.stringify`) while
     * remaining backward-compatible with raw unquoted strings.
     */
    private deserializeStringValue(rawValue: string | null): string | null {
        if (!rawValue) {
            return null;
        }

        try {
            const parsed: unknown = JSON.parse(rawValue);
            return typeof parsed === 'string' ? parsed : rawValue;
        } catch {
            return rawValue;
        }
    }
}