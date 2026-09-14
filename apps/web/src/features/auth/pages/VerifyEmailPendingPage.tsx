import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Input, Alert } from '@/shared/components/ui';
import { AuthLayout } from '../components/AuthLayout';
import { authApi, AuthApiError } from '../api/auth.api';

interface LocationState {
    email?: string;
}

export function VerifyEmailPendingPage() {
    const location = useLocation();
    const state = location.state as LocationState | null;

    const [email, setEmail] = useState(state?.email || '');
    const [isResending, setIsResending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // 60-second cooldown timer for rate-limit protection
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;

        setIsResending(true);
        setFeedback(null);

        try {
            const response = await authApi.resendVerification(email);
            setFeedback({ type: 'success', text: response.message });
            setCooldown(60);
        } catch (err) {
            if (err instanceof AuthApiError && err.statusCode === 429) {
                setFeedback({
                    type: 'error',
                    text: 'Rate limit reached (3 attempts per 15 minutes). Please check your inbox or wait before retrying.',
                });
            } else {
                setFeedback({
                    type: 'error',
                    text: 'Unable to dispatch verification email. Please check your network connection.',
                });
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout
            badgeText="SECURITY VERIFICATION"
            title="Check Your Inbox"
            subtitle="We have dispatched an activation link to verify your academic credentials"
            emblemIcon={
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            }
            bottomPrompt={{
                text: 'Wrong email address?',
                actionText: 'Register Again',
                to: '/register',
            }}
        >
            <div className="space-y-4">
                {/* Highlighted Email Badge */}
                {email ? (
                    <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-center space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Verification sent to
            </span>
                        <p className="text-sm font-semibold text-slate-900 break-all">{email}</p>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-center">
                        <p className="text-xs text-slate-600">
                            Please click the link sent to your registered email address to complete verification.
                        </p>
                    </div>
                )}

                {/* Step-by-Step Instructions */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-red-50 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
                        <span>Open your inbox and search for <strong>Verify your Royal Academy account</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-red-50 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
                        <span>Click the crimson <strong>Verify Account</strong> button inside.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-red-50 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
                        <span>Be sure to check your spam/junk folder if the email doesn't appear in 2 minutes.</span>
                    </div>
                </div>

                {feedback && (
                    <Alert variant={feedback.type === 'success' ? 'info' : 'error'}>
                        <span className="text-xs">{feedback.text}</span>
                    </Alert>
                )}

                {/* Inline Resend Form */}
                <form onSubmit={handleResend} className="space-y-3 pt-1">
                    {!email && (
                        <Input
                            label="Account Email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    )}

                    <Button
                        type="submit"
                        variant="outline"
                        isLoading={isResending}
                        disabled={cooldown > 0}
                        className="w-full rounded-full py-3 text-xs"
                    >
                        {cooldown > 0
                            ? `Resend link in ${cooldown}s`
                            : "Didn't receive email? Resend link"}
                    </Button>
                </form>

                <div className="text-center pt-2">
                    <Link
                        to="/login"
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        ← Return to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}