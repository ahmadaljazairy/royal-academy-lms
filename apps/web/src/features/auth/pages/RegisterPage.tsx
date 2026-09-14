import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '@/shared/components/ui';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth, AuthApiError } from '../context/AuthContext';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[] | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessages(null);

        if (!agreeTerms) {
            setErrorMessages(['You must accept the Terms of Service and Privacy Policy to continue.']);
            return;
        }

        setIsSubmitting(true);
        try {
            await register({
                displayName,
                email,
                password,
                termsAccepted: agreeTerms,
            });
            navigate('/verify-email-pending', { state: { email } });
        } catch (err) {
            if (err instanceof AuthApiError) {
                setErrorMessages(err.messages);
            } else {
                setErrorMessages(['Registration failed. Please check your network connection.']);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            badgeText="REGISTRATION"
            title="Create Your Account"
            subtitle="Start your professional learning journey with Royal Academy"
            errorMessages={errorMessages}
            errorTitle="Registration Issue"
            emblemIcon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            }
            bottomPrompt={{
                text: 'Already have an account?',
                actionText: 'Sign In',
                to: '/login',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name"
                    placeholder="e.g. Sarah Jenkins"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    leftIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                />

                <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />

                <Input
                    label="Password"
                    placeholder="Create a secure password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    helperText="ⓘ Must be at least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    }
                />

                <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 leading-normal">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            id="agreeTerms"
                            name="agreeTerms"
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span>
              I agree to the{' '}
                            <Link to="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
                    </label>
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full rounded-full py-3.5 mt-2 shadow-lg shadow-red-950/20"
                >
                    Create Account →
                </Button>
            </form>
        </AuthLayout>
    );
}