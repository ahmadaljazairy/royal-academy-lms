import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, Alert } from '@/shared/components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { authApi, AuthApiError } from '../api/auth.api';

interface LocationState {
    email?: string;
}

function formatCooldown(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function VerifyEmailPendingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const state = location.state as LocationState | null;

    const [email, setEmail] = useState<string>(() => {
        return state?.email || sessionStorage.getItem('pending_verification_email') || '';
    });

    const [hasPresetEmail] = useState<boolean>(() => {
        return Boolean(state?.email || sessionStorage.getItem('pending_verification_email'));
    });

    const [isResending, setIsResending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (state?.email) {
            sessionStorage.setItem('pending_verification_email', state.email);
        }
    }, [state?.email]);

    const getStorageKey = useCallback((targetEmail: string) => {
        const sanitized = targetEmail.toLowerCase().trim();
        return `cooldown:resend-verif:${sanitized || 'default'}`;
    }, []);

    const getRemainingSeconds = useCallback((targetEmail: string): number => {
        try {
            const stored = localStorage.getItem(getStorageKey(targetEmail));
            if (!stored) return 0;
            const expiresAt = parseInt(stored, 10);
            if (Number.isNaN(expiresAt)) return 0;
            const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
            return remaining > 0 ? remaining : 0;
        } catch {
            return 0;
        }
    }, [getStorageKey]);

    const [cooldown, setCooldown] = useState<number>(() => getRemainingSeconds(email));

    const triggerCooldown = useCallback((seconds: number, targetEmail: string) => {
        try {
            const expiresAt = Date.now() + seconds * 1000;
            localStorage.setItem(getStorageKey(targetEmail), expiresAt.toString());
        } catch {
            // Ignore storage restrictions
        }
        setCooldown(seconds);
    }, [getStorageKey]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            const remaining = getRemainingSeconds(email);
            setCooldown(remaining);

            if (remaining <= 0) {
                try {
                    localStorage.removeItem(getStorageKey(email));
                } catch {
                    // Ignore
                }
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown, email, getRemainingSeconds, getStorageKey]);

    useEffect(() => {
        const remaining = getRemainingSeconds(email);
        if (remaining > 0) {
            setCooldown(remaining);
        }
    }, [email, getRemainingSeconds]);

    // Safely leaves the verification screen by terminating any unverified session first
    const handleExitFlow = async (targetRoute: string) => {
        sessionStorage.removeItem('pending_verification_email');
        if (isAuthenticated) {
            try {
                await logout();
            } catch {
                // Proceed even if network logout fails
            }
        }
        navigate(targetRoute);
    };

    const handleResend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const targetEmail = email.trim();
        if (!targetEmail || cooldown > 0) return;

        setIsResending(true);
        setFeedback(null);

        try {
            const response = await authApi.resendVerification(targetEmail);
            setFeedback({ type: 'success', text: response.message });
            triggerCooldown(60, targetEmail);
        } catch (err) {
            if (err instanceof AuthApiError && err.statusCode === 429) {
                triggerCooldown(900, targetEmail);
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
                onClick: () => handleExitFlow('/register'),
            }}
        >
            <div className="space-y-4">
                {/* Highlighted Email Badge */}
                {hasPresetEmail && email ? (
                    <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-center space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Verification sent to
            </span>
                        <p className="text-sm font-semibold text-slate-900 break-all">{email}</p>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-4 text-center">
                        <p className="text-xs text-slate-600">
                            Please check your inbox or enter your email below to receive a new activation link.
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
                        <span>Check your spam folder if the email doesn't appear in 2 minutes.</span>
                    </div>
                </div>

                {feedback && (
                    <Alert variant={feedback.type === 'success' ? 'info' : 'error'}>
                        <span className="text-xs">{feedback.text}</span>
                    </Alert>
                )}

                {/* Resend Form */}
                <form onSubmit={handleResend} className="space-y-3 pt-1">
                    {!hasPresetEmail && (
                        <Input
                            label="Account Email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={cooldown > 0}
                        />
                    )}

                    <Button
                        type="submit"
                        variant="outline"
                        isLoading={isResending}
                        disabled={cooldown > 0 || !email.trim()}
                        className="w-full rounded-full py-3 text-xs"
                    >
                        {cooldown > 0
                            ? `Resend link in ${formatCooldown(cooldown)}`
                            : "Didn't receive email? Resend link"}
                    </Button>
                </form>

                {/* Escape action: logs out before navigating to /login */}
                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => handleExitFlow('/login')}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                        ← Return to Sign In
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}