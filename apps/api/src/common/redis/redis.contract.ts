/**
 * @file Redis Contract Definition & Guard Utilities
 * @module @template/api/common/redis/redis.contract
 * @description Provides a strongly-typed contract schema that handles versioning,
 * namespace prefixing, segment sanitization, and phantom type tracking.
 */

export interface RedisContractOptions<TArgs extends unknown[], TPayload> {
    /** Domain namespace prefix (e.g., 'auth:session', 'rl:window') */
    readonly namespace: string;

    /** Schema version tag for automatic cache isolation (defaults to 1) */
    readonly version?: number;

    /** Default TTL in seconds */
    readonly ttl: number;

    /** Dynamic key segment generator (returns parameter segment) */
    readonly key: (...args: TArgs) => string;
}

export interface RedisContract<TArgs extends unknown[], TPayload> {
    readonly namespace: string;
    readonly version: number;
    readonly ttl: number;
    /** Generates fully qualified, versioned, and normalized Redis key string */
    key(...args: TArgs): string;
    /** Phantom type marker for compile-time payload inference */
    readonly _payloadType?: TPayload;
}

/**
 * Sanitizes raw key parameters (e.g. URI paths `/api/v1/auth/login` -> `api:v1:auth:login`)
 * to maintain clean, hierarchical colon separators inside Redis.
 */
export function sanitizeKeySegment(segment: string): string {
    return segment
        .replace(/^\/+|\/+$/g, '')
        .replace(/[\/\s]+/g, ':')
        .toLowerCase();
}

/**
 * Type-safe contract builder ensuring strict generic inference, automatic versioning,
 * and namespace prefixing (`<namespace>:v<version>:<segment>`).
 */
export function defineRedisContract<TArgs extends unknown[], TPayload>(
    options: RedisContractOptions<TArgs, TPayload>,
): RedisContract<TArgs, TPayload> {
    const version = options.version ?? 1;
    const prefix = `${options.namespace}:v${version}`;

    return {
        namespace: options.namespace,
        version,
        ttl: options.ttl,
        key: (...args: TArgs) => {
            const segment = options.key(...args);
            return segment ? `${prefix}:${segment}` : prefix;
        },
    };
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