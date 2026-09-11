import {Injectable, Logger} from '@nestjs/common';
import {RedisService} from '../common/redis/redis.service.js';
import {TokenService} from '../common/security/token.service.js';

export enum TokenType {
    EMAIL_VERIFICATION = 'verify',
    PASSWORD_RESET = 'reset',
}

interface TokenConfig {
    prefix: string;
    ttlSeconds: number;
}

const TOKEN_SPECS: Record<TokenType, TokenConfig> = {
    [TokenType.EMAIL_VERIFICATION]: {
        prefix: 'auth:verify:',
        ttlSeconds: 86400, // 24 hours
    },
    [TokenType.PASSWORD_RESET]: {
        prefix: 'auth:reset:',
        ttlSeconds: 3600, // 1 hour
    },
};

@Injectable()
export class AuthTokenManager {
    private readonly logger = new Logger(AuthTokenManager.name);

    constructor(
        private readonly redis: RedisService,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * Hashes a raw token using TokenService's SHA-256 helper.
     */
    hashToken(rawToken: string): string {
        return this.tokenService.hashToken(rawToken);
    }

    /**
     * Generates a 32-byte secure random token, stores SHA-256(token) -> userId in Redis,
     * and returns both the raw token (for the user link) and the hash (for audit logging).
     */
    async generateToken(
        type: TokenType,
        userId: string,
    ): Promise<{ rawToken: string; tokenHash: string }> {
        const rawToken = this.tokenService.generateRandomToken(32);
        const tokenHash = this.tokenService.hashToken(rawToken);
        const spec = TOKEN_SPECS[type];
        const redisKey = `${spec.prefix}${tokenHash}`;

        await this.redis.getClient().set(redisKey, userId, 'EX', spec.ttlSeconds);

        return { rawToken, tokenHash };
    }

    /**
     * Atomically validates and consumes an ephemeral token.
     * If valid, deletes the token from Redis and returns the associated userId.
     * Returns null if the token is invalid, expired, or already consumed.
     */
    async consumeToken(type: TokenType, rawToken: string): Promise<string | null> {
        if (!rawToken || typeof rawToken !== 'string') {
            return null;
        }

        const tokenHash = this.tokenService.hashToken(rawToken);
        const spec = TOKEN_SPECS[type];
        const redisKey = `${spec.prefix}${tokenHash}`;
        const client = this.redis.getClient();

        try {
            // Atomic fetch-and-delete (Redis 6.2+)
            return await client.getdel(redisKey);
        } catch (error) {
            this.logger.warn(
                `Redis GETDEL failed, falling back to multi/exec pipeline for key: ${redisKey}`,
                error,
            );
            const pipeline = client.multi();
            pipeline.get(redisKey);
            pipeline.del(redisKey);
            const results = await pipeline.exec();

            const firstEntry = results?.[0];
            if (!firstEntry || firstEntry[0]) {
                return null;
            }

            return (firstEntry[1] as string) || null;
        }
    }
}