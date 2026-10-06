/**
 * @file Core Redis Service
 * @module @template/api/common/redis/redis.service
 * @description Low-level Redis abstraction executing contract operations,
 * legacy string operations, and lifecycle termination.
 *
 * Features:
 * 1. Contract-Driven Key Generation with automatic namespace and versioning.
 * 2. Explicit `setWithTtl` for dynamic TTL overrides (e.g. rememberMe).
 * 3. Prototype Pollution Defense: Strips `__proto__` and constructor tampering.
 * 4. Non-Crashing Serialization: Traps JSON parse exceptions and evicts corrupt keys.
 * 5. Full Backward Compatibility with raw string operations and lifecycle hooks.
 */

import {
    Injectable,
    Inject,
    type OnApplicationShutdown,
    Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants.js';
import { type RedisContract, isRedisContract } from './redis.contract.js';

@Injectable()
export class RedisService implements OnApplicationShutdown {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

    /**
     * Access the underlying ioredis client.
     * Preferred accessor to legacy `getClient()`.
     */
    get raw(): Redis {
        return this.client;
    }

    /**
     * Legacy client accessor.
     * @deprecated Use `this.redis.raw` for direct driver operations.
     */
    getClient(): Redis {
        return this.client;
    }

    // ===========================================================================
    // GET OVERLOADS
    // ===========================================================================

    /**
     * Contract-Driven Get: Deserializes JSON and enforces type inference.
     */
    async get<TArgs extends unknown[], TPayload>(
        contract: RedisContract<TArgs, TPayload>,
        ...args: TArgs
    ): Promise<TPayload | null>;

    /**
     * Legacy Get: Reads raw string value directly by key.
     * @deprecated Migrate to `RedisContract` to guarantee schema consistency.
     */
    async get(key: string): Promise<string | null>;

    async get(
        contractOrKey: RedisContract<unknown[], unknown> | string,
        ...args: unknown[]
    ): Promise<unknown> {
        if (typeof contractOrKey === 'string') {
            return this.client.get(contractOrKey);
        }

        const key = contractOrKey.key(...args);
        const raw = await this.client.get(key);

        if (!raw) {
            return null;
        }

        try {
            // Safe parsing defense against prototype pollution
            return JSON.parse(raw, (k, v) => {
                if (k === '__proto__' || k === 'constructor') {
                    return undefined;
                }
                return v;
            });
        } catch (error) {
            this.logger.error(
                `Failed to deserialize payload for key "${key}". Purging invalid cache entry.`,
                error instanceof Error ? error.stack : undefined,
            );
            await this.client.del(key);
            return null;
        }
    }

    // ===========================================================================
    // SET OVERLOADS
    // ===========================================================================

    /**
     * Contract-Driven Set: Serializes payload and applies contract TTL.
     */
    async set<TArgs extends unknown[], TPayload>(
        contract: RedisContract<TArgs, TPayload>,
        payload: TPayload,
        ...args: TArgs
    ): Promise<void>;

    /**
     * Legacy Set: Writes string value with optional TTL.
     * @deprecated Migrate to `RedisContract` to guarantee schema consistency.
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null>;

    async set(
        contractOrKey: RedisContract<unknown[], unknown> | string,
        payloadOrValue: unknown,
        ...rest: unknown[]
    ): Promise<'OK' | null | void> {
        if (!isRedisContract(contractOrKey)) {
            const key = contractOrKey;
            const value = String(payloadOrValue);
            const ttlSeconds = typeof rest[0] === 'number' ? rest[0] : undefined;

            if (ttlSeconds && ttlSeconds > 0) {
                return this.client.set(key, value, 'EX', ttlSeconds);
            }
            return this.client.set(key, value);
        }

        const key = contractOrKey.key(...rest);
        const serialized = JSON.stringify(payloadOrValue);

        if (contractOrKey.ttl > 0) {
            await this.client.set(key, serialized, 'EX', contractOrKey.ttl);
            return;
        }

        await this.client.set(key, serialized);
    }

    /**
     * Explicit Dynamic TTL Set: Serializes payload and overrides the contract TTL.
     * Solves parameter ambiguity when applying dynamic TTLs (e.g., rememberMe).
     */
    async setWithTtl<TArgs extends unknown[], TPayload>(
        contract: RedisContract<TArgs, TPayload>,
        payload: TPayload,
        ttlSeconds: number,
        ...args: TArgs
    ): Promise<void> {
        const key = contract.key(...args);
        const serialized = JSON.stringify(payload);

        if (ttlSeconds > 0) {
            await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, serialized);
        }
    }

    // ===========================================================================
    // DELETE OVERLOADS
    // ===========================================================================

    /**
     * Contract-Driven Del: Evicts a key based on contract rules.
     */
    async del<TArgs extends unknown[]>(
        contract: RedisContract<TArgs, unknown>,
        ...args: TArgs
    ): Promise<number>;

    /**
     * Legacy Del: Evicts a key by its raw string.
     */
    async del(key: string): Promise<number>;

    async del(
        contractOrKey: RedisContract<unknown[], unknown> | string,
        ...args: unknown[]
    ): Promise<number> {
        const key = isRedisContract(contractOrKey)
            ? contractOrKey.key(...args)
            : contractOrKey;

        return this.client.del(key);
    }

    // ===========================================================================
    // EXTENDED CONVENIENCE UTILITIES
    // ===========================================================================

    /**
     * Check if a contract key or raw string key exists.
     */
    async has<TArgs extends unknown[]>(
        contract: RedisContract<TArgs, unknown>,
        ...args: TArgs
    ): Promise<boolean>;
    async has(key: string): Promise<boolean>;
    async has(
        contractOrKey: RedisContract<unknown[], unknown> | string,
        ...args: unknown[]
    ): Promise<boolean> {
        const key = isRedisContract(contractOrKey)
            ? contractOrKey.key(...args)
            : contractOrKey;

        const count = await this.client.exists(key);
        return count > 0;
    }

    /**
     * Graceful lifecycle termination.
     */
    async onApplicationShutdown(signal?: string): Promise<void> {
        this.logger.log(`Closing Redis connection pool due to signal (${signal ?? 'SHUTDOWN'})...`);
        try {
            await this.client.quit();
            this.logger.log('Redis client cleanly disconnected');
        } catch (error) {
            this.logger.error('Error while disconnecting Redis client. Forcing disconnect...', error);
            this.client.disconnect();
        }
    }
}