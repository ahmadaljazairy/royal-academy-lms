import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@template/database';


export const SecurityAuditEvent = {
    AUTH_REGISTER: 'AUTH_REGISTER',
    AUTH_VERIFY_EMAIL_REQUESTED: 'AUTH_VERIFY_EMAIL_REQUESTED',
    AUTH_VERIFY_EMAIL_COMPLETED: 'AUTH_VERIFY_EMAIL_COMPLETED',
    AUTH_PASSWORD_RESET_REQUESTED: 'AUTH_PASSWORD_RESET_REQUESTED',
    AUTH_PASSWORD_RESET_COMPLETED: 'AUTH_PASSWORD_RESET_COMPLETED',
    AUTH_ALL_SESSIONS_REVOKED: 'AUTH_ALL_SESSIONS_REVOKED',
    /** Revokes all sessions except current active session
     * */
    AUTH_PASSWORD_CHANGED: 'AUTH_PASSWORD_CHANGED'
} as const;

export type SecurityAuditEventType =
    (typeof SecurityAuditEvent)[keyof typeof SecurityAuditEvent];

export interface RecordAuditLogParams {
    userId?: string | null;
    event: SecurityAuditEventType | string;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Appends an immutable audit log record to PostgreSQL.
     * Fails gracefully without breaking user request flows.
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
            this.logger.error(
                `Failed to persist audit log event [${params.event}] for user [${params.userId ?? 'anonymous'}]`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}