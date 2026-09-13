export const EMAIL_QUEUE = 'email-queue';

export const EMAIL_JOB = {
    SEND_VERIFICATION: 'send-verification',
    SEND_PASSWORD_RESET: 'send-password-reset',
} as const;

export interface SendVerificationJobPayload {
    to: string;
    token: string;
}

export interface SendPasswordResetJobPayload {
    to: string;
    token: string;
}