import { LegalLayout, LegalSection } from '../components';

const TOC = [
    { id: 'section-1', label: '1. Collection' },
    { id: 'section-2', label: '2. Use' },
    { id: 'section-3', label: '3. Cookies' },
    { id: 'section-4', label: '4. Sharing' },
    { id: 'section-5', label: '5. Security' },
    { id: 'section-6', label: '6. Rights' },
    { id: 'section-7', label: '7. Contact' },
];

export function PrivacyPolicyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            badgeText="DATA PROTECTION & PRIVACY"
            effectiveDate="September 2026"
            tocItems={TOC}
            nextPage={{ label: 'View Terms of Service', to: '/terms' }}
            emblemIcon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM10.5 16.5L6.5 12.5L7.91 11.09L10.5 13.67L16.09 8.09L17.5 9.5L10.5 16.5Z" />
                </svg>
            }
        >
            {/* 1. Collection */}
            <LegalSection id="section-1" index={1} title="Information We Collect">
                <div className="space-y-2.5">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
            </LegalSection>

            {/* 2. Usage */}
            <LegalSection id="section-2" index={2} title="How We Use Your Information">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                    {[
                        'Providing access to interactive learning environments, video modules, and assessments.',
                        'Authenticating identity, managing active Redis sessions, and verifying RBAC permissions.',
                        'Generating, issuing, and validating verifiable digital certificates.',
                        'Detecting and preventing fraud, academic misconduct, or unauthorized infrastructure access.',
                        'Communicating administrative announcements, grade releases, and critical system updates.',
                    ].map((text, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                            <div className="w-4 h-4 rounded-full bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </LegalSection>

            {/* 3. Cookies */}
            <LegalSection id="section-3" index={3} title="Cookie & Session Policy">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-1.5">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-primary flex items-center justify-center">
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
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-primary flex items-center justify-center">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Persistent Sessions</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            If selected during login (&quot;Remember Me&quot;), an encrypted token remains stored for up to 30 days to facilitate continuous access across browser restarts.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-1.5">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-primary flex items-center justify-center">
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
            </LegalSection>

            {/* 4. Data Sharing */}
            <LegalSection id="section-4" index={4} title="Data Sharing and Third Parties">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                    <p className="text-xs text-slate-700 font-medium">
                        We do not sell personal data. Information is disclosed only under the following conditions:
                    </p>
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                        <div className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <span><strong className="text-slate-900">Accreditation Bodies:</strong> Verifying certification credentials upon explicit student authorization or employer verification requests.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <span><strong className="text-slate-900">Service Providers:</strong> Cloud hosting, database infrastructure, and payment gateways operating under strict data processing agreements.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <span><strong className="text-slate-900">Legal Compliance:</strong> When required by applicable law, court order, or governmental regulation.</span>
                        </div>
                    </div>
                </div>
            </LegalSection>

            {/* 5. Retention & Security */}
            <LegalSection id="section-5" index={5} title="Data Retention and Security">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Account and academic records are retained for as long as your account remains active or as required to maintain the permanent integrity of accredited certification registries. We implement standard cryptographic hashing, role-based authorization, and network isolation to protect data at rest and in transit.
                    </p>
                </div>
            </LegalSection>

            {/* 6. User Rights */}
            <LegalSection id="section-6" index={6} title="Your Data Rights">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Depending on your jurisdiction (including GDPR regulations), you have the right to request access to your personal data, request corrections of inaccuracies, export your records, or request account deletion, subject to regulatory requirements for retaining academic transcripts.
                    </p>
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
            </LegalSection>

            {/* 7. Contact Information */}
            <LegalSection id="section-7" index={7} title="Contact Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">EMAIL INQUIRY</span>
                            <a href="mailto:privacy@royalacademy.com" className="text-xs font-semibold text-slate-900 hover:text-primary transition-colors">
                                privacy@royalacademy.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0">
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
            </LegalSection>
        </LegalLayout>
    );
}