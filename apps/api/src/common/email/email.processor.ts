/**
 * @file Email Queue Worker Processor
 * @module @royal-academy/api/common/email/email.processor
 * @description Background BullMQ worker executing queued email delivery jobs.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import nodemailer, { type Transporter } from 'nodemailer';
import { EMAIL_JOB, EMAIL_QUEUE } from './email.constants.js';
import { EmailTemplateBuilder } from './email-template.builder.js';
import type {
    SendPasswordResetJobPayload,
    SendVerificationJobPayload,
} from './email.interfaces.js';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);
    private readonly transporter: Transporter;
    private readonly webAppUrl: string;
    private readonly fromAddress: string;

    constructor() {
        super();

        this.webAppUrl = process.env.WEB_APP_URL || 'http://localhost:5173';
        this.fromAddress =
            process.env.SMTP_FROM || 'Royal Academy <no-reply@royalacademy.com>';

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '127.0.0.1',
            port: Number(process.env.SMTP_PORT || 1025),
            secure: process.env.SMTP_SECURE === 'true',
            ignoreTLS: process.env.NODE_ENV === 'development',
        });
    }

    /**
     * Primary entry point called by BullMQ for incoming jobs.
     */
    async process(job: Job): Promise<void> {
        switch (job.name) {
            case EMAIL_JOB.SEND_VERIFICATION:
                await this.handleVerification(
                    job.data as SendVerificationJobPayload,
                );
                break;

            case EMAIL_JOB.SEND_PASSWORD_RESET:
                await this.handlePasswordReset(
                    job.data as SendPasswordResetJobPayload,
                );
                break;

            default:
                this.logger.warn(`Unrecognized email job type: ${job.name}`);
        }
    }

    /**
     * Renders verification template and dispatches email via SMTP.
     */
    private async handleVerification(
        data: SendVerificationJobPayload,
    ): Promise<void> {
        const { subject, html } = EmailTemplateBuilder.buildVerificationTemplate(
            this.webAppUrl,
            data.token,
        );

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: data.to,
            subject,
            html,
        });

        this.logger.log(`Verification email successfully delivered to: ${data.to}`);
    }

    /**
     * Renders password reset template and dispatches email via SMTP.
     */
    private async handlePasswordReset(
        data: SendPasswordResetJobPayload,
    ): Promise<void> {
        const { subject, html } = EmailTemplateBuilder.buildPasswordResetTemplate(
            this.webAppUrl,
            data.token,
        );

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: data.to,
            subject,
            html,
        });

        this.logger.log(`Password reset email successfully delivered to: ${data.to}`);
    }
}