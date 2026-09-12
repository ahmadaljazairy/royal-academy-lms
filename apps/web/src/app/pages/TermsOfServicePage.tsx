import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button } from '@/shared/components/ui';

export function TermsOfServicePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[var(--color-primary)] selection:text-white py-6 px-4 sm:px-6 lg:px-8">
            {/* Top Header Navigation */}
            <header className="max-w-[760px] mx-auto flex items-center justify-between pb-6">
                <BrandLogo size="md" />
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[var(--color-primary)] transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </header>

            {/* Main 760px Container Frame */}
            <main className="max-w-[760px] mx-auto bg-white rounded-[28px] border border-slate-200/70 shadow-[0_20px_50px_rgba(15,23,42,0.05)] overflow-hidden">
                {/* Top 6px Crimson Stripe */}
                <div className="h-1.5 w-full bg-[var(--color-primary)]" />

                <div className="p-6 sm:p-10 lg:p-12 space-y-8">
                    {/* Header Badge, Headline & Metadata */}
                    <div className="text-center space-y-3 pt-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-red-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                            INSTITUTIONAL LEGAL CHARTER & GOVERNANCE
                        </div>

                        <h1
                            className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight"
                            style={{ fontFamily: 'var(--font-headline)' }}
                        >
                            Terms of Service
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Effective Date: September 2026
              </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Entity: Royal Academy International Training Center
              </span>
                        </div>
                    </div>

                    {/* Table of Contents Pill Bar */}
                    <nav aria-label="Table of contents" className="flex items-center gap-2.5 overflow-x-auto rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] px-4 py-2.5 text-[11px] text-slate-600 no-scrollbar">
            <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Contents
            </span>
                        <span className="text-slate-300">|</span>
                        <a href="#section-1" className="hover:text-slate-950 shrink-0">1. Acceptance</a>
                        <span>•</span>
                        <a href="#section-2" className="hover:text-slate-950 shrink-0">2. Security</a>
                        <span>•</span>
                        <a href="#section-3" className="hover:text-slate-950 shrink-0">3. Integrity</a>
                        <span>•</span>
                        <a href="#section-4" className="hover:text-slate-950 shrink-0">4. IP Rights</a>
                        <span>•</span>
                        <a href="#section-5" className="hover:text-slate-950 shrink-0">5. Fees</a>
                        <span>•</span>
                        <a href="#section-6" className="hover:text-slate-950 shrink-0">6. Termination</a>
                        <span>•</span>
                        <a href="#section-7" className="hover:text-slate-950 shrink-0">7. Liability</a>
                    </nav>

                    {/* SECTION 1 */}
                    <section id="section-1" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                1
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Acceptance of Terms
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                By creating an account, logging in to the platform, or accessing any course materials provided by Royal Academy International Training Center (&quot;Royal Academy,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you confirm that you are at least 18 years of age (or have parental/guardian consent), possess the legal capacity to enter into binding agreements, and agree to adhere to these Terms of Service.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section id="section-2" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                2
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                User Accounts and Security
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                            {[
                                'You must provide accurate, current, and complete information during registration.',
                                'You are responsible for safeguarding your login credentials and preventing unauthorized account access.',
                                'Sharing account credentials, allowing third-party access to course content, or bypassing role-based access restrictions is strictly prohibited and results in immediate account suspension.',
                                'Royal Academy must be notified immediately of any suspected unauthorized use or security breach.',
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                                    <div className="w-4 h-4 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section id="section-3" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                3
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Academic Integrity & Certification Standards
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                            {[
                                'Enrolled candidates must independently complete all coursework, practical assignments, quizzes, and examinations.',
                                'Plagiarism, unauthorized collaboration, automated assignment submissions, or identity fraud during assessments will result in immediate disqualification without refund.',
                                'Royal Academy reserves the right to withhold, cancel, or revoke any issued certificate or credential if academic dishonesty is discovered post-completion.',
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                                    <div className="w-4 h-4 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section id="section-4" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                4
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Intellectual Property Rights
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                All training curricula, videos, source code, slides, syllabi, and documentation hosted on the portal remain the exclusive intellectual property of Royal Academy and its licensed instructors. Enrollees are granted a limited, personal, non-exclusive, non-transferable license to access the materials solely for educational purposes. Copying, recording, republishing, or redistributing course assets is prohibited.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section id="section-5" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                5
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Fees, Subscriptions, and Cancellations
                            </h2>
                        </div>

                        <div className="space-y-2.5">
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed self-center">
                                    Access to premium courses and certification resources requires verified payment receipt.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed self-center">
                                    Refund eligibility depends on the specific course tier, refund window, and course progress (typically requested within 7 days of purchase and prior to completing more than 20% of module content).
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed self-center">
                                    Examination and processing fees are non-refundable once scheduled.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section id="section-6" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                6
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Termination of Access
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Royal Academy reserves the right to suspend or terminate your account and access to the services at its sole discretion, without prior notice, if you violate these Terms, breach security policies, or engage in disruptive conduct within academic forums.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 7 */}
                    <section id="section-7" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                7
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Limitation of Liability
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Services and educational materials are provided &quot;as is&quot; without warranty of any kind. Royal Academy shall not be liable for any indirect, punitive, or consequential damages resulting from platform downtime, missed deadlines, or employment outcomes.
                            </p>
                        </div>
                    </section>

                    {/* Card Bottom Controls */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[var(--color-primary)] transition-colors"
                        >
                            ← Go to Home Page
                        </Link>

                        <Link to="/privacy">
                            <Button size="sm" className="rounded-full px-5">
                                View Privacy Policy →
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Security Accreditation & Footer */}
            <footer className="max-w-[760px] mx-auto py-8 text-center space-y-3">
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