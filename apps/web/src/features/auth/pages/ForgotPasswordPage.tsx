import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert } from '@/shared/components/ui';
import { useCooldown } from '@/shared/hooks';
import { AuthLayout } from '../components/AuthLayout';
import { authApi, AuthApiError } from '../api/auth.api';

function formatCooldown(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const cooldownKey = `cooldown:forgot-password:${email.toLowerCase().trim() || 'default'}`;
    const { cooldown, startCooldown, isCoolingDown } = useCooldown(cooldownKey, 60);

    const handleSubmit = async (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        const targetEmail = email.trim();
        if (!targetEmail || isCoolingDown) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await authApi.forgotPassword(targetEmail);
            setIsSubmitted(true);
            startCooldown(60);
        } catch (err) {
            if (err instanceof AuthApiError && err.statusCode === 429) {
                startCooldown(900);
                setErrorMessage('Too many reset requests. Please wait 15 minutes before retrying.');
            } else {
                setErrorMessage('Unable to process password reset. Please check your network connection.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            badgeText="ACCOUNT RECOVERY"
            title="Reset Your Password"
            subtitle="Enter your verified account email to receive recovery instructions"
            emblemIcon={
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                </svg>
            }
            bottomPrompt={{
                text: 'Remembered your password?',
                actionText: 'Sign In',
                to: '/login',
            }}
        >
            <div className="space-y-4">
                {errorMessage && (
                    <Alert variant="error">
                        <span className="text-xs">{errorMessage}</span>
                    </Alert>
                )}

                {isSubmitted ? (
                    <div className="space-y-4 pt-1">
                        <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                Dispatch Complete
              </span>
                            <p className="text-xs text-slate-700 leading-relaxed">
                                If an account matches <strong>{email}</strong>, a recovery link has been delivered. The link is single-use and expires in <strong>1 hour</strong>.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleSubmit()}
                            disabled={isCoolingDown || isSubmitting}
                            className="w-full rounded-full py-3 text-xs"
                        >
                            {isCoolingDown
                                ? `Resend available in ${formatCooldown(cooldown)}`
                                : 'Resend Instructions'}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Account Email"
                            type="email"
                            placeholder="student@royalacademy.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />

                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={isCoolingDown || !email.trim()}
                            className="w-full rounded-full py-3.5 shadow-lg shadow-red-950/20"
                        >
                            Send Reset Link →
                        </Button>
                    </form>
                )}

                <div className="text-center pt-2">
                    <Link
                        to="/login"
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}