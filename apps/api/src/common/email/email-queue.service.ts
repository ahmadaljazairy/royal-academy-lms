/**
 * @file Email Queue Producer Service
 * @module @royal-academy/api/common/email/email-queue.service
 * @description Provides type-safe methods for dispatching email jobs to BullMQ.
 */

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
    DEFAULT_EMAIL_JOB_OPTIONS,
    EMAIL_JOB,
    EMAIL_QUEUE,
} from './email.constants.js';
import type {
    SendPasswordResetJobPayload,
    SendVerificationJobPayload,
} from './email.interfaces.js';

@Injectable()
export class EmailQueueService {
    private readonly logger = new Logger(EmailQueueService.name);

    constructor(
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue,
    ) {}

    /**
     * Enqueues an account verification email job.
     */
    async queueVerificationEmail(to: string, token: string): Promise<void> {
        const payload: SendVerificationJobPayload = { to, token };

        await this.emailQueue.add(
            EMAIL_JOB.SEND_VERIFICATION,
            payload,
            DEFAULT_EMAIL_JOB_OPTIONS,
        );

        this.logger.log(`Enqueued verification email job for: ${to}`);
    }

    /**
     * Enqueues a password reset email job.
     */
    async queuePasswordResetEmail(to: string, token: string): Promise<void> {
        const payload: SendPasswordResetJobPayload = { to, token };

        await this.emailQueue.add(
            EMAIL_JOB.SEND_PASSWORD_RESET,
            payload,
            DEFAULT_EMAIL_JOB_OPTIONS,
        );

        this.logger.log(`Enqueued password reset email job for: ${to}`);
    }
}