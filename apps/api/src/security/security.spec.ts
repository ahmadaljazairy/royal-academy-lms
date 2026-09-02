import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Argon2Service } from './argon2.service.js';
import { TokenService } from './token.service.js';

describe('Security Services', () => {
    it('should hash a password and verify it accurately', async () => {
        const argon2Service = new Argon2Service();
        const plainText = 'SecureAcademyPassword2026!';
        const hash = await argon2Service.hashPassword(plainText);

        assert.ok(hash, 'Hash should be defined');
        assert.notStrictEqual(hash, plainText);

        const match = await argon2Service.verifyPassword(hash, plainText);
        assert.strictEqual(match, true);

        const mismatch = await argon2Service.verifyPassword(hash, 'IncorrectPassword');
        assert.strictEqual(mismatch, false);
    });

    it('should generate secure hex tokens and correct future expiration dates', () => {
        const tokenService = new TokenService();
        const hours = 12;
        const { token, expiresAt } = tokenService.generateTokenWithExpiry(hours);

        assert.strictEqual(typeof token, 'string');
        assert.strictEqual(token.length, 64);
        assert.ok(expiresAt instanceof Date);

        const expectedTime = Date.now() + hours * 60 * 60 * 1000;
        assert.ok(Math.abs(expiresAt.getTime() - expectedTime) < 2000);
    });
});