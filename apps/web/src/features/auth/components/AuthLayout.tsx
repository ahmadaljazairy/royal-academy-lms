import React from 'react';
import { Link } from 'react-router-dom';
import { MinimalHeader, Alert } from '@/shared/components/ui';

interface AuthLayoutProps {
    /** Uppercase tracking badge (e.g., "LOGIN", "REGISTRATION") */
    badgeText: string;
    /** Primary page heading */
    title: string;
    /** Explanatory subtext */
    subtitle?: string;
    /** SVG emblem rendered inside the circular badge */
    emblemIcon: React.ReactNode;
    /** Server-side error messages to display in the alert */
    errorMessages?: string[] | null;
    /** Title for the error alert (defaults to "Authentication Failed") */
    errorTitle?: string;
    /** Navigation target for the top-left back action (defaults to history rollback) */
    backTo?: string;
    backLabel?: string;
    /** Bottom switch prompt (e.g. "Don't have an account?", "Sign Up", "/register") */
    bottomPrompt?: {
        text: string;
        actionText: string;
        to?: string;
        onClick?: () => void | Promise<void>;
    };
    /** Custom bottom content override if not using the standard prompt */
    bottomContent?: React.ReactNode;
    children: React.ReactNode;
}

export function AuthLayout({
                               badgeText,
                               title,
                               subtitle,
                               emblemIcon,
                               errorMessages,
                               errorTitle = 'Authentication Failed',
                               backTo,
                               backLabel = 'Back',
                               bottomPrompt,
                               bottomContent,
                               children,
                           }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-[#F8FAFC] overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Background Ambient Radial Glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-162.5 bg-red-100/40 rounded-full blur-3xl -z-10" />

            {/* Distraction-free navigation */}
            <MinimalHeader backTo={backTo} backLabel={backLabel} />

            {/* Centered Main Form Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
                <div className="w-full max-w-120 bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100 space-y-6">
                    {/* Header Badge & Title */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary shadow-sm">
                            {emblemIcon}
                        </div>

                        <span className="block text-xs font-bold tracking-widest uppercase text-primary">
              {badgeText}
            </span>

                        <h1
                            className="text-2xl sm:text-3xl font-bold text-slate-900"
                            style={{ fontFamily: 'var(--font-headline)' }}
                        >
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Server Validation Alert */}
                    {errorMessages && errorMessages.length > 0 && (
                        <Alert variant="error" title={errorTitle}>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                {errorMessages.map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    {/* Form Fields & Controls */}
                    {children}

                    {/* Standardized Bottom Switch Box */}
                    {bottomPrompt && (
                        <div className="rounded-2xl bg-[#F0F4FD] p-4 text-center text-xs text-slate-600">
                            {bottomPrompt.text}{' '}
                            {bottomPrompt.onClick ? (
                                <button
                                    type="button"
                                    onClick={bottomPrompt.onClick}
                                    className="font-semibold text-primary hover:underline ml-1 cursor-pointer"
                                >
                                    {bottomPrompt.actionText}
                                </button>
                            ) : (
                                <Link
                                    to={bottomPrompt.to || '#'}
                                    className="font-semibold text-primary hover:underline ml-1"
                                >
                                    {bottomPrompt.actionText}
                                </Link>
                            )}
                        </div>
                    )}

                    {bottomContent && (
                        <div className="text-center text-xs text-slate-500 pt-1">
                            {bottomContent}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center space-y-3">
                <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-500">
                    <Link to="/privacy" className="hover:text-slate-900 transition-colors">
                        Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link to="/terms" className="hover:text-slate-900 transition-colors">
                        Terms of Service
                    </Link>
                    <span>•</span>
                    <Link to="/help" className="hover:text-slate-900 transition-colors">
                        Help Desk
                    </Link>
                </div>
                <p className="text-[11px] text-slate-400">
                    © 2026 Royal Academy International Training Center. Committed to Global Academic Distinction.
                </p>
            </footer>
        </div>
    );
}