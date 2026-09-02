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
     * @param expiresInHours - E.g., 24 hours for email verification, 1 hour for password resets.
     */
    generateTokenWithExpiry(expiresInHours: number): { token: string; expiresAt: Date } {
        const token = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        return { token, expiresAt };
    }
}