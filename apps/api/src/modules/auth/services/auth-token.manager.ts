/**
 * @file Ephemeral Auth Token Manager
 * @module @royal-academy/api/modules/auth/services/auth-token.manager
 * @description Domain orchestrator for generating, hashing, and atomically consuming single-use
 * verification and password reset tokens.
 */

import { Injectable } from '@nestjs/common';
import { TokenService } from '../../../common/security/token.service.js';
import {
    AuthCacheRepository,
    type EphemeralTokenType,
} from '../cache/auth-cache.repository.js';

export enum TokenType {
    EMAIL_VERIFICATION = 'verify',
    PASSWORD_RESET = 'reset',
}

export interface GeneratedTokenResult {
    readonly rawToken: string;
    readonly tokenHash: string;
}

@Injectable()
export class AuthTokenManager {
    constructor(
        private readonly tokenCache: AuthCacheRepository,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * Computes an SHA-256 digest of a raw token using TokenService.
     */
    hashToken(rawToken: string): string {
        return this.tokenService.hashToken(rawToken);
    }

    /**
     * Generates a 32-byte token, computes its SHA-256 digest, persists
     * `tokenHash -> userId` in Redis via AuthCacheRepository, and returns both formats.
     */
    async generateToken(
        type: TokenType | EphemeralTokenType,
        userId: string,
    ): Promise<GeneratedTokenResult> {
        const rawToken = this.tokenService.generateRandomToken(32);
        const tokenHash = this.hashToken(rawToken);

        await this.tokenCache.setEphemeralToken(
            type as EphemeralTokenType,
            tokenHash,
            userId,
        );

        return { rawToken, tokenHash };
    }

    /**
     * Validates and atomically consumes a single-use token by deleting it from Redis.
     */
    async consumeToken(
        type: TokenType | EphemeralTokenType,
        rawToken: string,
    ): Promise<string | null> {
        if (!rawToken || typeof rawToken !== 'string') {
            return null;
        }

        const tokenHash = this.hashToken(rawToken);
        return this.tokenCache.consumeEphemeralToken(
            type as EphemeralTokenType,
            tokenHash,
        );
    }
}