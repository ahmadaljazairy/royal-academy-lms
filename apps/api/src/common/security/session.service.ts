import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { TokenService } from './token.service.js';
import {
    AuditLogService,
    SecurityAuditEvent,
} from '../audit/audit-log.service.js';
import type { UserSession, Role } from '@template/types';

export interface CreateSessionInput {
    userId: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
}

export interface SessionResult {
    sessionId: string;
    expiresAt: Date;
    session: UserSession;
}

export interface SessionMetadata {
    ipAddress?: string;
    userAgent?: string;
}

export const SESSION_TTL_HOURS = {
    STANDARD: Number(process.env.SESSION_STANDARD_TTL_HOURS ?? 24),
    REMEMBER_ME: Number(process.env.SESSION_REMEMBER_ME_TTL_HOURS ?? 720), // 30 days
} as const;

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private readonly sessionPrefix = 'session:';
    private readonly userSessionsPrefix = 'user:sessions:';

    constructor(
        private readonly redisService: RedisService,
        private readonly tokenService: TokenService,
        private readonly audit: AuditLogService,
    ) {}

    /**
     * Creates a new session, writes payload to Redis, and registers
     * the sessionId in the user's active session set.
     */
    async createSession(
        input: CreateSessionInput,
        ttlHours: number = SESSION_TTL_HOURS.STANDARD,
    ): Promise<SessionResult> {
        const { token: sessionId, expiresAt } =
            this.tokenService.generateTokenWithExpiry(ttlHours);

        const session: UserSession = {
            userId: input.userId,
            email: input.email,
            role: input.role,
            createdAt: Date.now(),
            isEmailVerified : input.isEmailVerified
        };

        const ttlSeconds = Math.floor(ttlHours * 3600);
        const sessionKey = `${this.sessionPrefix}${sessionId}`;
        const userSetKey = `${this.userSessionsPrefix}${input.userId}`;

        const redis = this.redisService.getClient();
        const pipeline = redis.pipeline();

        pipeline.set(sessionKey, JSON.stringify(session), 'EX', ttlSeconds);
        pipeline.sadd(userSetKey, sessionId);
        // Keep user index expiration aligned with the longest potential active session
        pipeline.expire(userSetKey, ttlSeconds);

        await pipeline.exec();

        return {
            sessionId,
            expiresAt,
            session,
        };
    }

    /**
     * Fetches and parses an active session payload.
     */
    async getSession(sessionId: string): Promise<UserSession | null> {
        if (!sessionId) {
            return null;
        }

        const key = `${this.sessionPrefix}${sessionId}`;
        const rawData = await this.redisService.get(key);

        if (!rawData) {
            return null;
        }

        try {
            return JSON.parse(rawData) as UserSession;
        } catch (error) {
            this.logger.error(`Corrupted session payload for key: ${key}`, error);
            await this.destroySession(sessionId);
            return null;
        }
    }

    /**
     * Destroys a single session and removes it from the user's active session set.
     */
    async destroySession(sessionId: string): Promise<boolean> {
        if (!sessionId) {
            return false;
        }

        const session = await this.getSession(sessionId);
        const sessionKey = `${this.sessionPrefix}${sessionId}`;

        const redis = this.redisService.getClient();
        const pipeline = redis.pipeline();

        pipeline.del(sessionKey);

        if (session?.userId) {
            const userSetKey = `${this.userSessionsPrefix}${session.userId}`;
            pipeline.srem(userSetKey, sessionId);
        }

        const results = await pipeline.exec();
        const deleteResult = results?.[0]?.[1] as number | undefined;

        return (deleteResult ?? 0) > 0;
    }

    /**
     * Atomically destroys all active sessions for a user and writes an immutable audit log.
     */
    async destroyAllUserSessions(
        userId: string,
        metadata?: SessionMetadata,
    ): Promise<number> {
        if (!userId) {
            return 0;
        }

        const redis = this.redisService.getClient();
        const userSetKey = `${this.userSessionsPrefix}${userId}`;

        const sessionIds = await redis.smembers(userSetKey);

        if (!sessionIds.length) {
            await redis.del(userSetKey);
            return 0;
        }

        const pipeline = redis.pipeline();
        for (const sessionId of sessionIds) {
            pipeline.del(`${this.sessionPrefix}${sessionId}`);
        }
        pipeline.del(userSetKey);

        await pipeline.exec();

        // Persist immutable audit log entry
        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_ALL_SESSIONS_REVOKED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { revokedSessionCount: sessionIds.length },
        });

        this.logger.log(
            `Revoked ${sessionIds.length} active sessions for user: ${userId}`,
        );

        return sessionIds.length;
    }

    /**
     * Destroys all active sessions for a user EXCEPT the currently active one,
     * and records an audit log event.
     */
    async destroyOtherUserSessions(
        userId: string,
        activeSessionId: string,
        metadata?: SessionMetadata,
    ): Promise<number> {
        if (!userId) {
            return 0;
        }

        const redis = this.redisService.getClient();
        const userSetKey = `${this.userSessionsPrefix}${userId}`;
        const allSessionIds = await redis.smembers(userSetKey);

        const sessionsToRevoke = allSessionIds.filter((id) => id !== activeSessionId);

        if (!sessionsToRevoke.length) {
            return 0;
        }

        const pipeline = redis.pipeline();
        for (const sid of sessionsToRevoke) {
            pipeline.del(`${this.sessionPrefix}${sid}`);
            pipeline.srem(userSetKey, sid);
        }

        await pipeline.exec();

        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_PASSWORD_CHANGED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: {
                revokedSessionCount: sessionsToRevoke.length,
                retainedSessionId: activeSessionId,
            },
        });

        this.logger.log(
            `Revoked ${sessionsToRevoke.length} other sessions for user ${userId} (retained ${activeSessionId})`,
        );

        return sessionsToRevoke.length;
    }

    /**
     * Patches active session payloads in Redis for a specific user
     * while preserving each session's remaining TTL.
     */
    async updateUserSessions(
        userId: string,
        partialUpdate: Partial<UserSession>,
    ): Promise<void> {
        if (!userId) {
            return;
        }

        const redis = this.redisService.getClient();
        const userSetKey = `${this.userSessionsPrefix}${userId}`;
        const sessionIds = await redis.smembers(userSetKey);

        if (!sessionIds.length) {
            return;
        }

        const pipeline = redis.pipeline();

        for (const sessionId of sessionIds) {
            const sessionKey = `${this.sessionPrefix}${sessionId}`;
            const [ttl, rawData] = await Promise.all([
                redis.ttl(sessionKey),
                redis.get(sessionKey),
            ]);

            // Stale index cleanup: session expired or was deleted
            if (ttl <= 0 || !rawData) {
                pipeline.srem(userSetKey, sessionId);
                continue;
            }

            try {
                const session = JSON.parse(rawData) as UserSession;
                const updatedSession: UserSession = {
                    ...session,
                    ...partialUpdate,
                };

                // Overwrite with updated attributes while maintaining the exact TTL remaining
                pipeline.set(sessionKey, JSON.stringify(updatedSession), 'EX', ttl);
            } catch (error) {
                this.logger.error(
                    `Failed to patch session payload for key: ${sessionKey}`,
                    error,
                );
            }
        }

        await pipeline.exec();
    }
}