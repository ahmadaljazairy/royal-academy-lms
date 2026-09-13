import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
    EMAIL_QUEUE,
    EMAIL_JOB,
    type SendVerificationJobPayload,
    type SendPasswordResetJobPayload,
} from './email.constants.js';

@Injectable()
export class EmailQueueService {
    private readonly logger = new Logger(EmailQueueService.name);

    constructor(
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue,
    ) {}

    async queueVerificationEmail(to: string, token: string): Promise<void> {
        const payload: SendVerificationJobPayload = { to, token };

        await this.emailQueue.add(EMAIL_JOB.SEND_VERIFICATION, payload, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000, // 2s, 4s, 8s retries
            },
            removeOnComplete: true,
            removeOnFail: false,
        });

        this.logger.log(`Enqueued verification email job for: ${to}`);
    }

    async queuePasswordResetEmail(to: string, token: string): Promise<void> {
        const payload: SendPasswordResetJobPayload = { to, token };

        await this.emailQueue.add(EMAIL_JOB.SEND_PASSWORD_RESET, payload, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });

        this.logger.log(`Enqueued password reset email job for: ${to}`);
    }
}