/**
 * @file Database Provider & NestJS Lifecycle Bridge
 * @module @royal-academy/api/common/prisma/prisma.service
 * @description Bridges the framework-agnostic Prisma engine from `@royal-academy/database`
 * into the NestJS Dependency Injection container.
 *
 * Architecture Highlights:
 * 1. Zero-Boilerplate Model Delegation: Extends `PrismaClient` to automatically expose
 *    all schema delegates (e.g., `this.prisma.user`, `this.prisma.course`) with full
 *    type safety and zero manual getter mappings.
 * 2. Shared Driver Configuration: Inherits the pre-tuned `pg.Pool` driver adapter and
 *    environment-driven log levels directly from `createPrismaClientOptions()`.
 * 3. Deterministic Lifecycle Management:
 *    - `onModuleInit`: Eagerly triggers `$connect()` at bootstrap to fail fast if the
 *      PostgreSQL cluster is unreachable.
 *    - `onModuleDestroy`: Flushes queries and cleanly drains the `pg.Pool` when SIGTERM
 *      is received during container rolling updates.
 */

import {
    Injectable,
    Logger,
    type OnModuleInit,
    type OnModuleDestroy,
} from '@nestjs/common';
import {
    PrismaClient,
    createPrismaClientOptions,
} from '@royal-academy/database';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        // Inherit the centralized pg.Pool adapter and logging configuration
        super(createPrismaClientOptions());
    }

    /**
     * Initializes the physical database connection at application startup.
     *
     * Enforces fail-fast behavior: if PostgreSQL is unreachable or credentials
     * are invalid, bootstrapping halts immediately rather than failing on the first HTTP request.
     */
    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            this.logger.log('Database connection pool established successfully via PrismaPg');
        } catch (error) {
            this.logger.error('Failed to establish database connection during bootstrap', error);
            throw error;
        }
    }

    /**
     * Gracefully drains the connection pool during application shutdown.
     *
     * Guarantees in-flight transactions complete before releasing TCP file descriptors.
     */
    async onModuleDestroy(): Promise<void> {
        try {
            await this.$disconnect();
            this.logger.log('Database connection pool cleanly drained and closed');
        } catch (error) {
            this.logger.error('Error encountered while draining database connection pool', error);
        }
    }
}