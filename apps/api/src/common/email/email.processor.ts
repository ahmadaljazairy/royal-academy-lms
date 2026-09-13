import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import nodemailer, { type Transporter } from 'nodemailer';
import {
    EMAIL_QUEUE,
    EMAIL_JOB,
    type SendVerificationJobPayload,
    type SendPasswordResetJobPayload,
} from './email.constants.js';

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
            ignoreTLS: true,
        });
    }

    async process(job: Job): Promise<void> {
        switch (job.name) {
            case EMAIL_JOB.SEND_VERIFICATION:
                await this.handleVerification(job.data as SendVerificationJobPayload);
                break;

            case EMAIL_JOB.SEND_PASSWORD_RESET:
                await this.handlePasswordReset(job.data as SendPasswordResetJobPayload);
                break;

            default:
                this.logger.warn(`Unrecognized email job type: ${job.name}`);
        }
    }

    private async handleVerification(data: SendVerificationJobPayload): Promise<void> {
        const link = `${this.webAppUrl}/verify-email?token=${data.token}`;
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); border-collapse: collapse;">
    <!-- Top Crimson Accent Bar -->
    <tr>
      <td style="height: 6px; background-color: #6B0110; padding: 0; line-height: 6px; font-size: 6px;">&nbsp;</td>
    </tr>

    <!-- Body Container -->
    <tr>
      <td style="padding: 40px 36px;">
        <!-- Header Emblem & Badge -->
        <table role="presentation" style="width: 100%; margin: 0 auto 24px auto; border-collapse: collapse;">
          <tr>
            <td style="text-align: center;">
              <div style="display: inline-block; width: 52px; height: 52px; background-color: #FAE8EA; border-radius: 50%; text-align: center; line-height: 52px; margin-bottom: 12px;">
                <span style="font-size: 24px; line-height: 52px; color: #6B0110;">✉</span>
              </div>
              <br/>
              <div style="display: inline-block; background-color: #FAE8EA; border: 1px solid #F3C6CB; border-radius: 9999px; padding: 4px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #6B0110; text-transform: uppercase;">
                SECURITY VERIFICATION
              </div>
            </td>
          </tr>
        </table>

        <!-- Main Heading -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Verify Your Email Address
              </h1>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <p style="margin: 0 auto; font-size: 13px; line-height: 1.6; color: #64748B; max-width: 420px;">
                Welcome to the <strong>Royal Academy LMS</strong>. Confirm your email address to activate your account, access enrolled courses, and verify academic certifications.
              </p>
            </td>
          </tr>
        </table>

        <!-- Action Button -->
        <table role="presentation" style="margin: 0 auto 28px auto; border-collapse: collapse;">
          <tr>
            <td style="border-radius: 9999px; background-color: #6B0110; text-align: center; box-shadow: 0 4px 14px rgba(107, 1, 16, 0.25);">
              <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 36px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                Verify Account &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Fallback Link Card -->
        <table role="presentation" style="width: 100%; background-color: #F0F4FD; border: 1px solid #E2EAF9; border-radius: 14px; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #334155;">
                Button not working? Paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; word-break: break-all;">
                <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #6B0110; text-decoration: underline;">${link}</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Security Notice -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding-top: 20px; font-size: 11px; line-height: 1.5; color: #94A3B8; text-align: center;">
              This verification link expires in <strong>24 hours</strong>. If you did not create an account on Royal Academy, you can safely disregard this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Institutional Global Footer -->
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 24px auto 0 auto; text-align: center; border-collapse: collapse;">
    <tr>
      <td style="font-size: 11px; color: #94A3B8; line-height: 1.6; text-align: center;">
        256-bit Institutional Encryption Standard &bull; ISO 27001 Certified Governance<br/>
        &copy; 2026 Royal Academy International Training Center. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: data.to,
            subject: 'Verify your Royal Academy account',
            html,
        });

        this.logger.log(`Verification email sent to: ${data.to}`);
    }

    private async handlePasswordReset(data: SendPasswordResetJobPayload): Promise<void> {
        const link = `${this.webAppUrl}/reset-password?token=${data.token}`;
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); border-collapse: collapse;">
    <!-- Top Crimson Accent Bar -->
    <tr>
      <td style="height: 6px; background-color: #6B0110; padding: 0; line-height: 6px; font-size: 6px;">&nbsp;</td>
    </tr>

    <!-- Body Container -->
    <tr>
      <td style="padding: 40px 36px;">
        <!-- Header Emblem & Badge -->
        <table role="presentation" style="width: 100%; margin: 0 auto 24px auto; border-collapse: collapse;">
          <tr>
            <td style="text-align: center;">
              <div style="display: inline-block; width: 52px; height: 52px; background-color: #FAE8EA; border-radius: 50%; text-align: center; line-height: 52px; margin-bottom: 12px;">
                <span style="font-size: 22px; line-height: 52px; color: #6B0110;">🔒</span>
              </div>
              <br/>
              <div style="display: inline-block; background-color: #FAE8EA; border: 1px solid #F3C6CB; border-radius: 9999px; padding: 4px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #6B0110; text-transform: uppercase;">
                ACCOUNT SECURITY RECOVERY
              </div>
            </td>
          </tr>
        </table>

        <!-- Main Heading -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <p style="margin: 0 auto; font-size: 13px; line-height: 1.6; color: #64748B; max-width: 420px;">
                We received a request to reset credentials for your <strong>Royal Academy</strong> account. Select the button below to establish a new password.
              </p>
            </td>
          </tr>
        </table>

        <!-- Action Button -->
        <table role="presentation" style="margin: 0 auto 28px auto; border-collapse: collapse;">
          <tr>
            <td style="border-radius: 9999px; background-color: #6B0110; text-align: center; box-shadow: 0 4px 14px rgba(107, 1, 16, 0.25);">
              <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 36px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                Reset Password &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Fallback Link Card -->
        <table role="presentation" style="width: 100%; background-color: #F0F4FD; border: 1px solid #E2EAF9; border-radius: 14px; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #334155;">
                Button not working? Paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; word-break: break-all;">
                <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #6B0110; text-decoration: underline;">${link}</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Security Notice -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding-top: 20px; font-size: 11px; line-height: 1.5; color: #94A3B8; text-align: center;">
              This link is single-use and expires in <strong>1 hour</strong>. If you did not initiate this request, your account remains secure and no changes were applied.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Institutional Global Footer -->
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 24px auto 0 auto; text-align: center; border-collapse: collapse;">
    <tr>
      <td style="font-size: 11px; color: #94A3B8; line-height: 1.6; text-align: center;">
        256-bit Institutional Encryption Standard &bull; ISO 27001 Certified Governance<br/>
        &copy; 2026 Royal Academy International Training Center. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: data.to,
            subject: 'Reset your Royal Academy password',
            html,
        });

        this.logger.log(`Password reset email sent to: ${data.to}`);
    }
}