/**
 * @file Database Client Singleton & Driver Adapter
 * @module @royal-academy/database/client
 * @description Configures and exports a unified PrismaClient instance powered by
 * the PostgreSQL driver adapter (`@prisma/adapter-pg` with `pg.Pool`).
 *
 * Architecture Highlights:
 * 1. Decoupled Options Factory: Exposes `createPrismaClientOptions()` so framework
 *    bridges (e.g., NestJS `PrismaService extends PrismaClient`) can inherit driver
 *    and pool configurations without instantiating duplicate connection pools.
 * 2. Lazy Singleton Proxy: Defers client and connection pool initialization until
 *    first member access. Prevents static module imports from throwing runtime errors
 *    during build, test orchestration, or metadata reflection.
 * 3. Hot-Reload Pool Caching: Caches the underlying client across development
 *    re-evaluations (HMR, Vite, Turborepo, Nest watch mode) using `globalThis`
 *    to prevent PostgreSQL connection exhaustion (`sorry, too many clients`).
 */

import { type Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Global execution context interface for non-production singleton caching.
 */
interface GlobalPrismaContext {
    prismaClientInstance?: PrismaClient;
}

const globalExecutionContext = globalThis as unknown as GlobalPrismaContext;

/**
 * Configuration overrides for the underlying PostgreSQL connection pool.
 */
export interface DatabasePoolOptions {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

/**
 * Assembles and returns Prisma Client options incorporating `@prisma/adapter-pg`
 * and a tuned `pg.Pool` connection pool.
 *
 * Shared across standalone consumers and framework bridges (`apps/api`).
 *
 * @param {DatabasePoolOptions} [overrides] Optional connection and pooling overrides.
 * @returns {Prisma.PrismaClientOptions} Configuration object accepted by `new PrismaClient()`.
 * @throws {Error} If `DATABASE_URL` is neither supplied in `overrides` nor present in the environment.
 */
export function createPrismaClientOptions(
    overrides?: DatabasePoolOptions,
): Prisma.PrismaClientOptions {
    const connectionString = overrides?.connectionString ?? process.env['DATABASE_URL'];

    if (!connectionString) {
        throw new Error(
            '❌ FATAL: DATABASE_URL environment variable is missing. ' +
            'Ensure environment configurations are loaded before instantiating database clients.',
        );
    }

    const pool = new pg.Pool({
        connectionString,
        max:
            overrides?.max ??
            (process.env['DB_POOL_MAX'] ? Number.parseInt(process.env['DB_POOL_MAX'], 10) : 10),
        idleTimeoutMillis: overrides?.idleTimeoutMillis ?? 30000,
        connectionTimeoutMillis: overrides?.connectionTimeoutMillis ?? 5000,
    });

    const adapter = new PrismaPg(pool);

    return {
        adapter,
        log:
            process.env['NODE_ENV'] === 'development'
                ? [
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ]
                : [{ emit: 'stdout', level: 'error' }],
    };
}

/**
 * Creates an un-cached, standalone `PrismaClient` instance.
 *
 * Recommended for discrete worker processes, parallel migration runtimes,
 * or unit testing environments requiring unique database contexts.
 *
 * @param {DatabasePoolOptions} [overrides] Optional configuration overrides.
 * @returns {PrismaClient} Newly instantiated PrismaClient.
 */
export function createPrismaClient(overrides?: DatabasePoolOptions): PrismaClient {
    return new PrismaClient(createPrismaClientOptions(overrides));
}

/**
 * Resolves the shared database client singleton.
 *
 * In production, instantiates a single persistent client per runtime container.
 * In development, returns or populates the `globalThis` memory cache.
 *
 * @returns {PrismaClient} Cached or newly initialized PrismaClient singleton.
 */
export function getPrismaClient(): PrismaClient {
    if (process.env['NODE_ENV'] === 'production') {
        return createPrismaClient();
    }

    if (!globalExecutionContext.prismaClientInstance) {
        globalExecutionContext.prismaClientInstance = createPrismaClient();
    }

    return globalExecutionContext.prismaClientInstance;
}

/**
 * Transparent Lazy Singleton Proxy.
 *
 * Proxies all member access to `getPrismaClient()`. Prevents static imports from
 * prematurely executing environment validations or opening database sockets.
 *
 * @example
 * ```typescript
 * import { prisma } from '@template/database';
 *
 * // Connection pool initialized lazily on this first invocation
 * const users = await prisma.user.findMany();
 * ```
 */
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, property: string | symbol) {
        const client = getPrismaClient();
        const value = Reflect.get(client, property);

        if (typeof value === 'function') {
            return value.bind(client);
        }

        return value;
    },
});

// Re-export generated model types, enums, client types, and runtime namespaces
export * from '@prisma/client';
export { PrismaClient };