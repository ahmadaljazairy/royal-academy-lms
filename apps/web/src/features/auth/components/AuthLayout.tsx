import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/shared/components/ui';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-[#F8FAFC] overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Background Ambient Radial Glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-162.5 bg-red-100/40 rounded-full blur-3xl -z-10" />

            {/* Top Navigation */}
            <header className="w-full px-6 py-5 sm:px-12 flex items-center justify-between">
                <BrandLogo size="md" />
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </header>

            {/* Centered Main Form Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-120 bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100">
                    {children}
                </div>
            </main>

            {/* Legal & Footer */}
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