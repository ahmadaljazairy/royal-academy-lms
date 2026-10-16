/**
 * @file Email Module Constants
 * @module @royal-academy/api/common/email/email.constants
 */

import type { JobsOptions } from 'bullmq';

export const EMAIL_QUEUE = 'email-queue';

export const EMAIL_JOB = {
    SEND_VERIFICATION: 'send-verification',
    SEND_PASSWORD_RESET: 'send-password-reset',
} as const;

export type EmailJobType = (typeof EMAIL_JOB)[keyof typeof EMAIL_JOB];

/**
 * Standard resilience options for BullMQ email queue jobs.
 */
export const DEFAULT_EMAIL_JOB_OPTIONS: JobsOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000, // Retries at 2s, 4s, 8s
    },
    removeOnComplete: true, // Auto-purge successful jobs from Redis
    removeOnFail: false,    // Retain failed jobs in Redis for dead-letter analysis
} as const;