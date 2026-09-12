import React from 'react';
import { Link } from 'react-router-dom';
import { MinimalHeader, Button } from '@/shared/components/ui';

export interface TocItem {
    id: string;
    label: string;
}

interface LegalLayoutProps {
    badgeText: string;
    title: string;
    effectiveDate?: string;
    entity?: string;
    emblemIcon?: React.ReactNode;
    tocItems?: TocItem[];
    nextPage?: {
        label: string;
        to: string;
    };
    children: React.ReactNode;
}

export function LegalLayout({
                                badgeText,
                                title,
                                effectiveDate = 'September 2026',
                                entity = 'Royal Academy International Training Center',
                                emblemIcon,
                                tocItems,
                                nextPage,
                                children,
                            }: LegalLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-primary selection:text-white pb-12">
            {/* Full-width header navigating to previous page */}
            <MinimalHeader />

            {/* Main 760px Document Card */}
            <main className="max-w-190 mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-[28px] border border-slate-200/70 shadow-[0_20px_50px_rgba(15,23,42,0.05)] overflow-hidden">
                    {/* Top 6px Accent Stripe */}
                    <div className="h-1.5 w-full text-primary" />

                    <div className="p-6 sm:p-10 lg:p-12 space-y-8">
                        {/* Header Metadata */}
                        <div className="text-center space-y-3 pt-2">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-primary flex items-center justify-center shadow-sm">
                                {emblemIcon || (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full bg-red-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-red-100">
                                <span className="w-1.5 h-1.5 rounded-full text-primary" />
                                {badgeText}
                            </div>

                            <h1
                                className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight"
                                style={{ fontFamily: 'var(--font-headline)' }}
                            >
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500 pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Effective Date: {effectiveDate}
                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Entity: {entity}
                </span>
                            </div>
                        </div>

                        {/* Quick Jump Bar */}
                        {tocItems && tocItems.length > 0 && (
                            <nav aria-label="Table of contents" className="flex items-center gap-2.5 overflow-x-auto rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] px-4 py-2.5 text-[11px] text-slate-600 no-scrollbar">
                <span className="font-bold text-primary flex items-center gap-1.5 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Contents
                </span>
                                <span className="text-slate-300">|</span>
                                {tocItems.map((item, idx) => (
                                    <React.Fragment key={item.id}>
                                        <a href={`#${item.id}`} className="hover:text-slate-950 shrink-0">
                                            {item.label}
                                        </a>
                                        {idx < tocItems.length - 1 && <span>•</span>}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}

                        {/* Document Content */}
                        <div className="space-y-6">
                            {children}
                        </div>

                        {/* Bottom Card Controls */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
                            >
                                ← Go to Home Page
                            </Link>

                            {nextPage && (
                                <Link to={nextPage.to}>
                                    <Button size="sm" className="rounded-full px-5">
                                        {nextPage.label} →
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Institutional Accreditation Footer */}
            <footer className="max-w-190 mx-auto px-4 py-8 text-center space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    256-bit Institutional Encryption Standard • ISO 27001 Certified Auditor
                </div>

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