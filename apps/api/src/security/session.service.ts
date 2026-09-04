import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { TokenService } from './token.service.js';
import type { UserSession, SystemRole } from '@template/types';

export interface CreateSessionInput {
    userId: string;
    email: string;
    role: SystemRole;
}

export interface SessionResult {
    sessionId: string;
    expiresAt: Date;
    session: UserSession;
}

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private readonly sessionPrefix = 'session:';
    private readonly defaultTtlHours: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly tokenService: TokenService,
    ) {
        // Default session lifespan is 168 hours (7 days)
        this.defaultTtlHours = Number(process.env.SESSION_TTL_HOURS ?? 168);
    }

    async createSession(input: CreateSessionInput, ttlHours?: number): Promise<SessionResult> {
        const hours = ttlHours ?? this.defaultTtlHours;
        const { token: sessionId, expiresAt } = this.tokenService.generateTokenWithExpiry(hours);

        const session: UserSession = {
            userId: input.userId,
            email: input.email,
            role: input.role,
            createdAt: Date.now(),
        };

        const ttlSeconds = Math.floor(hours * 3600);
        const key = `${this.sessionPrefix}${sessionId}`;

        await this.redisService.set(key, JSON.stringify(session), ttlSeconds);

        return {
            sessionId,
            expiresAt,
            session,
        };
    }

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
            await this.redisService.del(key);
            return null;
        }
    }

    async destroySession(sessionId: string): Promise<boolean> {
        if (!sessionId) {
            return false;
        }

        const key = `${this.sessionPrefix}${sessionId}`;
        const deletedCount = await this.redisService.del(key);
        return deletedCount > 0;
    }
}