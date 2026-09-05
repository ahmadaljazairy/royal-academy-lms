import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthService } from './auth.service.js';
import type { Argon2Service } from '../security/argon2.service.js';
import type { SessionService } from '../security/session.service.js';

describe('AuthService', () => {
    let authService: AuthService;
    let mockArgon2: Partial<Argon2Service>;
    let mockSession: Partial<SessionService>;

    beforeEach(() => {
        mockArgon2 = {
            hashPassword: async (pwd: string) => `hashed_${pwd}`,
            verifyPassword: async (hash: string, plain: string) => hash === `hashed_${plain}`,
        };

        mockSession = {
            createSession: async (input) => ({
                sessionId: 'mocked_session_token_64_characters_long_string_0123456789abcdef',
                expiresAt: new Date(Date.now() + 3600000),
                session: {
                    ...input,
                    createdAt: Date.now(),
                },
            }),
            destroySession: async () => true,
        };

        authService = new AuthService(
            mockArgon2 as Argon2Service,
            mockSession as SessionService,
        );
    });

    it('should instantiate cleanly', () => {
        assert.ok(authService);
    });
});