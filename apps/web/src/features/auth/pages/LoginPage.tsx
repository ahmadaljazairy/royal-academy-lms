import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '@/shared/components/ui';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth, AuthApiError } from '../context/AuthContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[] | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessages(null);
        setIsSubmitting(true);

        try {
            await login({ email, password, rememberMe });
            navigate('/dashboard');
        } catch (err) {
            if (err instanceof AuthApiError) {
                setErrorMessages(err.messages);
            } else {
                setErrorMessages(['Unable to sign in. Please verify your connection.']);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            badgeText="LOGIN"
            title="Welcome Back"
            subtitle="Sign in to access your courses, certifications, and learning portal"
            errorMessages={errorMessages}
            errorTitle="Authentication Failed"
            emblemIcon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                </svg>
            }
            bottomPrompt={{
                text: "Don't have an account?",
                actionText: 'Sign Up',
                to: '/register',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    cornerHint="Institutional ID"
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
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
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

                <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        Remember me
                    </label>
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-primary hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full rounded-full py-3.5 mt-2 shadow-lg shadow-red-950/20"
                >
                    Sign In →
                </Button>
            </form>
        </AuthLayout>
    );
}