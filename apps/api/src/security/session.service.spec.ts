import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';
import type { RedisService } from '../redis/redis.service.js';

describe('SessionService', () => {
    let sessionService: SessionService;
    let mockStore: Map<string, string>;
    let mockRedisService: Partial<RedisService>;

    beforeEach(() => {
        mockStore = new Map<string, string>();
        mockRedisService = {
            get: async (key: string) => mockStore.get(key) ?? null,
            set: async (key: string, val: string) => {
                mockStore.set(key, val);
                return 'OK';
            },
            del: async (key: string) => {
                const existed = mockStore.delete(key);
                return existed ? 1 : 0;
            },
        };

        sessionService = new SessionService(
            mockRedisService as RedisService,
            new TokenService(),
        );
    });

    it('should create a session with an opaque token and persist in redis', async () => {
        const input = {
            userId: 'user-uuid-1234',
            email: 'student@royalacademy.com',
            role: 'STUDENT' as const,
        };

        const { sessionId, session } = await sessionService.createSession(input, 2);

        assert.strictEqual(typeof sessionId, 'string');
        assert.strictEqual(sessionId.length, 64);
        assert.strictEqual(session.userId, input.userId);
        assert.strictEqual(session.email, input.email);

        const stored = await sessionService.getSession(sessionId);
        assert.deepStrictEqual(stored, session);
    });

    it('should return null for non-existent session IDs', async () => {
        const result = await sessionService.getSession('non_existent_token');
        assert.strictEqual(result, null);
    });

    it('should destroy an active session cleanly', async () => {
        const input = {
            userId: 'user-uuid-5678',
            email: 'instructor@royalacademy.com',
            role: 'INSTRUCTOR' as const,
        };

        const { sessionId } = await sessionService.createSession(input);
        const destroyed = await sessionService.destroySession(sessionId);
        assert.strictEqual(destroyed, true);

        const lookup = await sessionService.getSession(sessionId);
        assert.strictEqual(lookup, null);
    });
});