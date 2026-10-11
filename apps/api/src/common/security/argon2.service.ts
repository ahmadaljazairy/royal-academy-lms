/**
 * @file Argon2 Hashing & Verification Service
 * @module @royal-academy/api/common/security/argon2.service
 * @description Provides OWASP-compliant password hashing and verification using Argon2id.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * OWASP Recommended Parameters for Argon2id:
 * - Memory: 64 MB (65,536 KiB)
 * - Time Cost (Iterations): 3
 * - Parallelism: 4 threads
 */
const ARGON2_OPTIONS= {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
} as const;

@Injectable()
export class Argon2Service {
    private readonly logger = new Logger(Argon2Service.name);

    /**
     * Hashes a plain-text password using Argon2id.
     *
     * @param password - Plain-text candidate password
     * @returns Promise resolving to the encoded Argon2id hash
     */
    async hashPassword(password: string): Promise<string> {
        return argon2.hash(password, ARGON2_OPTIONS);
    }

    /**
     * Verifies a plain-text password against a stored Argon2id hash.
     * Fails safely and returns `false` if the hash string is malformed or corrupt.
     *
     * @param hash - Encoded Argon2id hash string
     * @param plainPassword - Plain-text candidate password
     * @returns Promise resolving to boolean match status
     */
    async verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plainPassword);
        } catch {
            this.logger.warn(
                'Password verification failed due to malformed or corrupted hash format.',
            );
            return false;
        }
    }
}