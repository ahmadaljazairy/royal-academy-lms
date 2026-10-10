/**
 * @file Security Audit Log Constants & Types
 * @module @royal-academy/api/common/audit/audit.constants
 */

import type { Prisma } from '@royal-academy/database';

export const SecurityAuditEvent = {
    AUTH_REGISTER: 'AUTH_REGISTER',
    AUTH_VERIFY_EMAIL_REQUESTED: 'AUTH_VERIFY_EMAIL_REQUESTED',
    AUTH_VERIFY_EMAIL_COMPLETED: 'AUTH_VERIFY_EMAIL_COMPLETED',
    AUTH_PASSWORD_RESET_REQUESTED: 'AUTH_PASSWORD_RESET_REQUESTED',
    AUTH_PASSWORD_RESET_COMPLETED: 'AUTH_PASSWORD_RESET_COMPLETED',
    AUTH_ALL_SESSIONS_REVOKED: 'AUTH_ALL_SESSIONS_REVOKED',
    AUTH_PASSWORD_CHANGED: 'AUTH_PASSWORD_CHANGED',
} as const;

export type SecurityAuditEventType = (typeof SecurityAuditEvent)[keyof typeof SecurityAuditEvent]

export interface RecordAuditLogParams {
    readonly userId?: string | null;
    readonly event: SecurityAuditEventType;
    readonly ipAddress?: string | null;
    readonly userAgent?: string | null;
    readonly metadata?: Prisma.InputJsonValue;
}