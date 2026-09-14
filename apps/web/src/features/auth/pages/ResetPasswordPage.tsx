import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Input, Alert } from '@/shared/components/ui';
import { AuthLayout } from '../components/AuthLayout';
import { authApi, AuthApiError } from '../api/auth.api';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Missing or corrupted token in URL
    if (!token) {
        return (
            <AuthLayout
                badgeText="INVALID RECOVERY REQUEST"
                title="Invalid Reset Token"
                subtitle="This password reset link is missing its cryptographic authorization token"
                emblemIcon={
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                }
                bottomPrompt={{
                    text: 'Need to recover your account?',
                    actionText: 'Request New Link',
                    to: '/forgot-password',
                }}
            >
                <div className="space-y-4 pt-2">
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
                        Please use the link sent to your email or submit a new reset request.
                    </div>
                    <Link to="/forgot-password">
                        <Button className="w-full rounded-full py-3">
                            Request New Reset Link →
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    // Successful submission view
    if (isSuccess) {
        return (
            <AuthLayout
                badgeText="CREDENTIALS UPDATED"
                title="Password Reset Complete"
                subtitle="Your new credentials are saved and existing sessions have been terminated"
                emblemIcon={
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                }
            >
                <div className="space-y-4 pt-2">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs text-emerald-800 text-center leading-relaxed">
                        For security, all active sessions on other devices have been invalidated. Please sign in with your new password.
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

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (newPassword.length < 8) {
            setErrorMessage('Password must contain at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please verify your input.');
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.resetPassword({ token, newPassword });
            setIsSuccess(true);
        } catch (err) {
            if (err instanceof AuthApiError) {
                setErrorMessage(err.messages[0] || 'This reset token has expired or already been used.');
            } else {
                setErrorMessage('Unable to reset password. Please check your network connection.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            badgeText="ACCOUNT RECOVERY"
            title="Create New Password"
            subtitle="Establish a new secure password for your Royal Academy account"
            backTo="/"
            backLabel = 'Home Page'
            emblemIcon={
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            }
            bottomPrompt={{
                text: 'Remember your password?',
                actionText: 'Sign In',
                to: '/login',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                    <Alert variant="error">
                        <span className="text-xs">{errorMessage}</span>
                    </Alert>
                )}

                <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Must be at least 8 characters with letters, numbers & symbols"
                />

                <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full rounded-full py-3.5 shadow-lg shadow-red-950/20"
                >
                    Update Password →
                </Button>
            </form>
        </AuthLayout>
    );
}