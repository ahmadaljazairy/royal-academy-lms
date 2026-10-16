/**
 * @file Email Job Interfaces
 * @module @royal-academy/api/common/email/email.interfaces
 */

export interface SendVerificationJobPayload {
    readonly to: string;
    readonly token: string;
}

export interface SendPasswordResetJobPayload {
    readonly to: string;
    readonly token: string;
}