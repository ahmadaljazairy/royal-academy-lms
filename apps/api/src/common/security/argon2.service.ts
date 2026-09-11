import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Service {
    /**
     * Hashes a plain-text password using the Argon2id algorithm.
     * Configured with OWASP-recommended memory and time costs.
     */
    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,
            parallelism: 4,
        });
    }

    /**
     * Safely verifies a plain-text password against a stored hash.
     */
    async verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plainPassword);
        } catch {
            return false;
        }
    }
}