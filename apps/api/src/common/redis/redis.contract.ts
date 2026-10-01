/**
 * @file Redis Contract Definition & Guard Utilities
 * @module @template/api/common/redis/redis.contract
 * @description Provides a pure TypeScript contract schema to bind key construction,
 * arguments, payload types, and TTLs at compile time without runtime schema dependencies.
 */

export interface RedisContract<TArgs extends unknown[], TPayload> {
    readonly namespace: string;
    readonly ttl: number; // TTL in seconds
    key(...args: TArgs): string;
    /**
     * Phantom type marker. Retains TPayload at compile time for inference
     * without runtime memory overhead.
     */
    readonly _payloadType?: TPayload;
}

/**
 * Type-safe contract builder ensuring strict generic inference.
 */
export function defineRedisContract<TArgs extends unknown[], TPayload>(definition: {
    namespace: string;
    ttl: number;
    key: (...args: TArgs) => string;
}): RedisContract<TArgs, TPayload> {
    return definition;
}

/**
 * Runtime type guard distinguishing a RedisContract from a legacy raw string key.
 */
export function isRedisContract(
    target: unknown,
): target is RedisContract<unknown[], unknown> {
    return (
        typeof target === 'object' &&
        target !== null &&
        'namespace' in target &&
        'key' in target &&
        typeof (target as Record<string, unknown>)['key'] === 'function'
    );
}