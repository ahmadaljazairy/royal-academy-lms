import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button } from '@/shared/components/ui';

export function PrivacyPolicyPage() {
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
                {/* Top 5px Crimson Stripe */}
                <div className="h-1.5 w-full bg-[var(--color-primary)]" />

                <div className="p-6 sm:p-10 lg:p-12 space-y-8">
                    {/* Header Badge, Headline & Metadata */}
                    <div className="text-center space-y-3 pt-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM10.5 16.5L6.5 12.5L7.91 11.09L10.5 13.67L16.09 8.09L17.5 9.5L10.5 16.5Z" />
                            </svg>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-red-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                            DATA PROTECTION & PRIVACY
                        </div>

                        <h1
                            className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight"
                            style={{ fontFamily: 'var(--font-headline)' }}
                        >
                            Privacy Policy
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
                        <a href="#section-1" className="hover:text-slate-950 shrink-0">1. Collection</a>
                        <span>•</span>
                        <a href="#section-2" className="hover:text-slate-950 shrink-0">2. Use</a>
                        <span>•</span>
                        <a href="#section-3" className="hover:text-slate-950 shrink-0">3. Cookies</a>
                        <span>•</span>
                        <a href="#section-4" className="hover:text-slate-950 shrink-0">4. Sharing</a>
                        <span>•</span>
                        <a href="#section-5" className="hover:text-slate-950 shrink-0">5. Security</a>
                        <span>•</span>
                        <a href="#section-6" className="hover:text-slate-950 shrink-0">6. Rights</a>
                        <span>•</span>
                        <a href="#section-7" className="hover:text-slate-950 shrink-0">7. Contact</a>
                    </nav>

                    {/* SECTION 1 */}
                    <section id="section-1" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                1
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Information We Collect
                            </h2>
                        </div>

                        <div className="space-y-2.5">
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900">Account Information</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                        Full name, institutional or personal email address, encrypted password hash, and assigned role (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">STUDENT</code>, <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">INSTRUCTOR</code>, <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">ADMIN</code>).
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900">Academic & Activity Records</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                        Course enrollment progress, grades, assessment submissions, certification logs, and forum participation.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900">Technical & Session Logs</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                        IP addresses, browser types, session timestamps, device identifiers, and audit logs.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900">Cookies & Local Storage</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                        Secure, HttpOnly session identifiers (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">sid</code>) used for authentication and persistent session management.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section id="section-2" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                2
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                How We Use Your Information
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                            {[
                                'Providing access to interactive learning environments, video modules, and assessments.',
                                'Authenticating identity, managing active Redis sessions, and verifying RBAC permissions.',
                                'Generating, issuing, and validating verifiable digital certificates.',
                                'Detecting and preventing fraud, academic misconduct, or unauthorized infrastructure access.',
                                'Communicating administrative announcements, grade releases, and critical system updates.',
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
                                Cookie & Session Policy
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-1.5">
                                <div className="w-7 h-7 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Session Cookies</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Temporary cryptographic tokens stored in your browser to maintain your login status. These tokens expire when your session ends or when the browser closes.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-1.5">
                                <div className="w-7 h-7 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Persistent Sessions</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    If selected during login ("Remember Me"), an encrypted token remains stored for up to 30 days to facilitate continuous access across browser restarts.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-1.5">
                                <div className="w-7 h-7 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Security Standards</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Authentication cookies are served strictly with HttpOnly, SameSite=Lax, and Secure attributes on production domains to prevent cross-site scripting (XSS) and cross-site request forgery (CSRF).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section id="section-4" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                4
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Data Sharing and Third Parties
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                            <p className="text-xs text-slate-700 font-medium">
                                We do not sell personal data. Information is disclosed only under the following conditions:
                            </p>

                            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                                <div className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <span><strong className="text-slate-900">Accreditation Bodies:</strong> Verifying certification credentials upon explicit student authorization or employer verification requests.</span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <span><strong className="text-slate-900">Service Providers:</strong> Cloud hosting, database infrastructure, and payment gateways operating under strict data processing agreements.</span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <span><strong className="text-slate-900">Legal Compliance:</strong> When required by applicable law, court order, or governmental regulation.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section id="section-5" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                5
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Data Retention and Security
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Account and academic records are retained for as long as your account remains active or as required to maintain the permanent integrity of accredited certification registries. We implement standard cryptographic hashing, role-based authorization, and network isolation to protect data at rest and in transit.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section id="section-6" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                6
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Your Data Rights
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3.5">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Depending on your jurisdiction (including GDPR regulations), you have the right to request access to your personal data, request corrections of inaccuracies, export your records, or request account deletion, subject to regulatory requirements for retaining academic transcripts.
                            </p>

                            {/* Data Rights Badges */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {['Right of Access', 'Data Rectification', 'Data Portability', 'Erasure & Transcript Retention'].map((badge) => (
                                    <span
                                        key={badge}
                                        className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                                    >
                    {badge}
                  </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7 */}
                    <section id="section-7" className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                7
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Contact Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">EMAIL INQUIRY</span>
                                    <a href="mailto:privacy@royalacademy.com" className="text-xs font-semibold text-slate-900 hover:text-[var(--color-primary)] transition-colors">
                                        privacy@royalacademy.com
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">SUPPORT LIAISON</span>
                                    <span className="text-xs font-semibold text-slate-900">Help Desk & Legal Office</span>
                                </div>
                            </div>
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

                        <Link to="/terms">
                            <Button size="sm" className="rounded-full px-5">
                                View Terms of Service →
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