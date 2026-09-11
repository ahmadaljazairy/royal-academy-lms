import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class TokenService {
    /**
     * Generates a raw cryptographically secure URL-safe hex string.
     */
    generateRandomToken(bytes = 32): string {
        return crypto.randomBytes(bytes).toString('hex');
    }

    /**
     * Generates a token paired with a calculated expiration Date.
     */
    generateTokenWithExpiry(expiresInHours: number): {
        token: string;
        expiresAt: Date;
    } {
        const token = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        return { token, expiresAt };
    }

    /**
     * Generates a SHA-256 hex digest of a given token.
     */
    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}