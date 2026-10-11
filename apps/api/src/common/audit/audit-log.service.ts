/**
 * @file Audit Log Service
 * @module @royal-academy/api/common/audit/audit-log.service
 * @description Persists immutable security audit records to PostgreSQL with fail-safe error isolation.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@royal-academy/database';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RecordAuditLogParams } from './audit.constants.js';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Appends an immutable security audit log record to PostgreSQL.
     *
     * @description Fail-safe execution: Catches and logs database write errors to prevent
     * auditing failures from crashing primary user HTTP request pipelines.
     */
    async record(params: RecordAuditLogParams): Promise<void> {
        try {
            await this.prisma.securityAuditLog.create({
                data: {
                    userId: params.userId ?? null,
                    event: params.event,
                    ipAddress: params.ipAddress ?? null,
                    userAgent: params.userAgent ?? null,
                    metadata: params.metadata ?? Prisma.JsonNull,
                },
            });
        } catch (error) {
            // Fail-safe isolation: Log error and preserve main request transaction
            this.logger.error(
                `Failed to persist audit log event [${params.event}] for user [${params.userId ?? 'anonymous'}]`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}