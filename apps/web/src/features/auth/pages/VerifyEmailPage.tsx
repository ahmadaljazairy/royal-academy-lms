import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Input, Alert, Spinner } from '@/shared/components/ui';
import { AuthLayout } from '../components/AuthLayout';
import { authApi, AuthApiError } from '../api/auth.api';

type VerificationStatus = 'verifying' | 'success' | 'error';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fallback resend form state
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendFeedback, setResendFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Prevents double execution in React StrictMode
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;

        if (!token) {
            setStatus('error');
            setErrorMessage('Verification token is missing or malformed.');
            return;
        }

        const performVerification = async () => {
            try {
                await authApi.verifyEmail(token);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                if (err instanceof AuthApiError) {
                    setErrorMessage(err.messages[0] || 'This verification link is invalid or has expired.');
                } else {
                    setErrorMessage('Unable to verify email. Please check your network connection.');
                }
            }
        };

        performVerification();
    }, [token]);

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleResend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!resendEmail) return;

        setIsResending(true);
        setResendFeedback(null);

        try {
            const res = await authApi.resendVerification(resendEmail);
            setResendFeedback({ type: 'success', text: res.message });
            setResendCooldown(60);
        } catch (err) {
            if (err instanceof AuthApiError && err.statusCode === 429) {
                setResendFeedback({
                    type: 'error',
                    text: 'Too many requests. Please wait 15 minutes before requesting another link.',
                });
            } else {
                setResendFeedback({
                    type: 'error',
                    text: 'Failed to request verification link. Please try again.',
                });
            }
        } finally {
            setIsResending(false);
        }
    };

    // 1. Verifying State
    if (status === 'verifying') {
        return (
            <AuthLayout
                badgeText="SECURITY VERIFICATION"
                title="Verifying Email"
                subtitle="Validating your single-use security token with the credential registry..."
                emblemIcon={
                    <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                }
            >
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                    <Spinner size="lg" className="text-primary" />
                    <p className="text-xs text-slate-500">Checking authorization status, please hold on...</p>
                </div>
            </AuthLayout>
        );
    }

    // 2. Success State
    if (status === 'success') {
        return (
            <AuthLayout
                badgeText="ACCOUNT ACTIVATED"
                title="Email Verified!"
                subtitle="Your email address has been verified. You now have full access to Royal Academy."
                emblemIcon={
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                }
                bottomPrompt={{
                    text: 'Ready to learn?',
                    actionText: 'View Available Courses',
                    to: '/',
                }}
            >
                <div className="space-y-4 pt-2">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-center">
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                            Institutional security checks complete. You can sign in and begin your studies immediately.
                        </p>
                    </div>

                    <Link to="/login" className="block">
                        <Button className="w-full rounded-full py-3.5 shadow-lg shadow-red-950/20">
                            Sign In to Dashboard →
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    // 3. Error / Expired State
    return (
        <AuthLayout
            badgeText="VERIFICATION FAILED"
            title="Link Expired or Invalid"
            subtitle="This verification link has already been used, expired, or was corrupted."
            emblemIcon={
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            }
            errorMessages={errorMessage ? [errorMessage] : null}
            errorTitle="Token Issue"
            bottomPrompt={{
                text: 'Already verified?',
                actionText: 'Sign In',
                to: '/login',
            }}
        >
            <div className="space-y-4 pt-2">
                <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-900 mb-1">Need a new verification link?</p>
                    Enter your account email below and we will dispatch a new single-use confirmation link.
                </div>

                {resendFeedback && (
                    <Alert variant={resendFeedback.type === 'success' ? 'info' : 'error'}>
                        <span className="text-xs">{resendFeedback.text}</span>
                    </Alert>
                )}

                <form onSubmit={handleResend} className="space-y-3">
                    <Input
                        label="Account Email"
                        type="email"
                        placeholder="student@royalacademy.com"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        leftIcon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                    />

                    <Button
                        type="submit"
                        isLoading={isResending}
                        disabled={resendCooldown > 0}
                        className="w-full rounded-full py-3 mt-1"
                    >
                        {resendCooldown > 0
                            ? `Resend available in ${resendCooldown}s`
                            : 'Resend Verification Link →'}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}