/**
 * @file Cryptographic Token Service
 * @module @royal-academy/api/common/security/token.service
 * @description Provides utilities for generating cryptographically secure random tokens,
 * calculating expiration windows, and computing SHA-256 hashes for secure token storage.
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

export interface TokenWithExpiry {
    readonly token: string;
    readonly expiresAt: Date;
}

@Injectable()
export class TokenService {
    /**
     * Generates a cryptographically secure random hex string.
     *
     * @param bytes - Number of random bytes of entropy (default: 32 bytes / 256 bits)
     * @returns Hexadecimal string representation of random bytes (default length: 64 chars)
     */
    generateRandomToken(bytes = 32): string {
        return crypto.randomBytes(bytes).toString('hex');
    }

    /**
     * Generates a raw random token paired with a calculated expiration Date.
     *
     * @param expiresInHours - Lifespan of the token in hours
     * @returns Object containing the raw token and calculated expiration timestamp
     */
    generateTokenWithExpiry(expiresInHours: number): TokenWithExpiry {
        const token = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        return { token, expiresAt };
    }

    /**
     * Computes a SHA-256 hex digest of a raw token for secure database storage.
     *
     * @param token - Raw plain-text token
     * @returns Deterministic 64-character SHA-256 hex string
     */
    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}