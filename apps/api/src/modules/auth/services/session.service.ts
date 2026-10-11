/**
 * @file Session Management Service
 * @module @royal-academy/api/modules/auth/services/session.service
 * @description High-level domain orchestrator handling token generation,
 * state persistence via SessionCacheRepository, and security audit logging.
 */

import { Injectable, Logger } from '@nestjs/common';
import type { Role, UserSession } from '@royal-academy/types';
import {
    AuditLogService,
    SecurityAuditEvent,
} from '../../../common/audit/index.js';
import { TokenService } from '../../../common/security/token.service.js';
import { AUTH_TTL } from '../cache/auth-cache.contracts.js';
import { AuthCacheRepository } from '../cache/auth-cache.repository.js';

export interface CreateSessionInput {
    userId: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
    rememberMe?: boolean;
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

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly sessionCache: AuthCacheRepository,
        private readonly tokenService: TokenService,
        private readonly audit: AuditLogService,
    ) {}

    /**
     * Creates a stateful session with dynamic TTL based on `rememberMe`.
     */
    async createSession(input: CreateSessionInput): Promise<SessionResult> {
        const ttlSeconds = input.rememberMe
            ? AUTH_TTL.SESSION_REMEMBER_ME
            : AUTH_TTL.SESSION_STANDARD;

        const ttlHours = ttlSeconds / 3600;

        const { token: sessionId, expiresAt } =
            this.tokenService.generateTokenWithExpiry(ttlHours);

        const session: UserSession = {
            userId: input.userId,
            email: input.email,
            role: input.role,
            createdAt: Date.now(),
            isEmailVerified: input.isEmailVerified,
        };

        await this.sessionCache.createSession(sessionId, session, ttlSeconds);

        return { sessionId, expiresAt, session };
    }

    /**
     * Retrieves an active session payload by session ID.
     */
    async getSession(sessionId: string): Promise<UserSession | null> {
        if (!sessionId) return null;
        return this.sessionCache.getSession(sessionId);
    }

    /**
     * Revokes a single session by session ID.
     */
    async destroySession(sessionId: string): Promise<boolean> {
        if (!sessionId) return false;
        const session = await this.getSession(sessionId);
        return this.sessionCache.destroySession(sessionId, session?.userId);
    }

    /**
     * Atomically revokes all active sessions for a user and writes an audit log entry.
     */
    async destroyAllUserSessions(
        userId: string,
        metadata?: SessionMetadata,
    ): Promise<number> {
        if (!userId) return 0;

        const revokedCount = await this.sessionCache.destroyAllUserSessions(userId);
        if (revokedCount === 0) return 0;

        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_ALL_SESSIONS_REVOKED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { revokedSessionCount: revokedCount },
        });

        this.logger.log(
            `Revoked ${revokedCount} active sessions for user: ${userId}`,
        );

        return revokedCount;
    }

    /**
     * Revokes all active sessions for a user EXCEPT the currently retained active session.
     */
    async destroyOtherUserSessions(
        userId: string,
        activeSessionId: string,
        metadata?: SessionMetadata,
    ): Promise<number> {
        if (!userId) return 0;

        const allSessionIds = await this.sessionCache.getUserSessionIds(userId);
        const sessionsToRevoke = allSessionIds.filter(
            (id) => id !== activeSessionId,
        );

        if (!sessionsToRevoke.length) return 0;

        await this.sessionCache.destroySessions(userId, sessionsToRevoke);

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
            `Revoked ${sessionsToRevoke.length} other sessions for user: ${userId}`,
        );

        return sessionsToRevoke.length;
    }

    /**
     * Patches user session attributes across all active sessions while maintaining TTLs.
     */
    async updateUserSessions(
        userId: string,
        partialUpdate: Partial<UserSession>,
    ): Promise<void> {
        if (!userId) return;
        await this.sessionCache.updateUserSessions(userId, partialUpdate);
    }
}