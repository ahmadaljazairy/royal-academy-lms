/**
 * @file Database Client Singleton & Driver Adapter
 * @module @template/database/client
 * @description Configures and exports a unified PrismaClient instance using
 * the PostgreSQL driver adapter (`@prisma/adapter-pg` with `pg.Pool`).
 *
 * Implements a global-variable caching pattern during development to prevent
 * connection pool exhaustion caused by hot-reloading in NestJS and Turborepo.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Augment the Node.js global namespace to safely store the cached Prisma instance.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Instantiates a configured PrismaClient connected through a PostgreSQL pool adapter.
 *
 * @returns {PrismaClient} A fully configured PrismaClient instance.
 * @throws {Error} If `DATABASE_URL` is not defined in the runtime environment.
 *
 * @internal
 */
function createPrismaClient(): PrismaClient {
    const connectionString = process.env['DATABASE_URL'];

    if (!connectionString) {
        throw new Error(
            '❌ FATAL: DATABASE_URL environment variable is missing. ' +
            'Ensure your environment configuration is loaded before instantiating the database client.',
        );
    }

    // Configure underlying connection pool
    const pool = new pg.Pool({
        connectionString,
        // Max connections per container instance (adjust based on PostgreSQL max_connections)
        max: process.env['DB_POOL_MAX'] ? Number.parseInt(process.env['DB_POOL_MAX'], 10) : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log:
            process.env['NODE_ENV'] === 'development'
                ? [
                    { emit: 'stdout', level: 'query' },
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ]
                : [{ emit: 'stdout', level: 'error' }],
    });
}

/**
 * Shared singleton instance of the PrismaClient.
 *
 * In production, a single persistent client is created per process.
 * In development, the client is cached on `globalThis` across module hot-reloads.
 *
 * @example
 * ```typescript
 * import { prisma } from '@template/database';
 *
 * const user = await prisma.user.findUnique({
 *   where: { email: 'student@example.com' },
 * });
 * ```
 */
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Cache the active instance in non-production environments
if (process.env['NODE_ENV'] !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Re-export all Prisma model types, enums, and generated namespaces
export * from '@prisma/client';
export type { PrismaClient };