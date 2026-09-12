import { LegalLayout, LegalSection } from '../components';

const TOC = [
    { id: 'section-1', label: '1. Acceptance' },
    { id: 'section-2', label: '2. Security' },
    { id: 'section-3', label: '3. Integrity' },
    { id: 'section-4', label: '4. IP Rights' },
    { id: 'section-5', label: '5. Fees' },
    { id: 'section-6', label: '6. Termination' },
    { id: 'section-7', label: '7. Liability' },
];

export function TermsOfServicePage() {
    return (
        <LegalLayout
            title="Terms of Service"
            badgeText="INSTITUTIONAL LEGAL CHARTER & GOVERNANCE"
            effectiveDate="September 2026"
            tocItems={TOC}
            nextPage={{ label: 'View Privacy Policy', to: '/privacy' }}
            emblemIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            }
        >
            {/* 1. Acceptance */}
            <LegalSection id="section-1" index={1} title="Acceptance of Terms">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        By creating an account, logging in to the platform, or accessing any course materials provided by Royal Academy International Training Center (&quot;Royal Academy,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you confirm that you are at least 18 years of age (or have parental/guardian consent), possess the legal capacity to enter into binding agreements, and agree to adhere to these Terms of Service.
                    </p>
                </div>
            </LegalSection>

            {/* 2. User Accounts */}
            <LegalSection id="section-2" index={2} title="User Accounts and Security">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                    {[
                        'You must provide accurate, current, and complete information during registration.',
                        'You are responsible for safeguarding your login credentials and preventing unauthorized account access.',
                        'Sharing account credentials, allowing third-party access to course content, or bypassing role-based access restrictions is strictly prohibited and results in immediate account suspension.',
                        'Royal Academy must be notified immediately of any suspected unauthorized use or security breach.',
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

            {/* 3. Academic Integrity */}
            <LegalSection id="section-3" index={3} title="Academic Integrity & Certification Standards">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
                    {[
                        'Enrolled candidates must independently complete all coursework, practical assignments, quizzes, and examinations.',
                        'Plagiarism, unauthorized collaboration, automated assignment submissions, or identity fraud during assessments will result in immediate disqualification without refund.',
                        'Royal Academy reserves the right to withhold, cancel, or revoke any issued certificate or credential if academic dishonesty is discovered post-completion.',
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

            {/* 4. IP Rights */}
            <LegalSection id="section-4" index={4} title="Intellectual Property Rights">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        All training curricula, videos, source code, slides, syllabi, and documentation hosted on the portal remain the exclusive intellectual property of Royal Academy and its licensed instructors. Enrollees are granted a limited, personal, non-exclusive, non-transferable license to access the materials solely for educational purposes. Copying, recording, republishing, or redistributing course assets is prohibited.
                    </p>
                </div>
            </LegalSection>

            {/* 5. Fees & Cancellations */}
            <LegalSection id="section-5" index={5} title="Fees, Subscriptions, and Cancellations">
                <div className="space-y-2.5">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed self-center">
                            Access to premium courses and certification resources requires verified payment receipt.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed self-center">
                            Refund eligibility depends on the specific course tier, refund window, and course progress (typically requested within 7 days of purchase and prior to completing more than 20% of module content).
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed self-center">
                            Examination and processing fees are non-refundable once scheduled.
                        </p>
                    </div>
                </div>
            </LegalSection>

            {/* 6. Termination */}
            <LegalSection id="section-6" index={6} title="Termination of Access">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Royal Academy reserves the right to suspend or terminate your account and access to the services at its sole discretion, without prior notice, if you violate these Terms, breach security policies, or engage in disruptive conduct within academic forums.
                    </p>
                </div>
            </LegalSection>

            {/* 7. Limitation of Liability */}
            <LegalSection id="section-7" index={7} title="Limitation of Liability">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Services and educational materials are provided &quot;as is&quot; without warranty of any kind. Royal Academy shall not be liable for any indirect, punitive, or consequential damages resulting from platform downtime, missed deadlines, or employment outcomes.
                    </p>
                </div>
            </LegalSection>
        </LegalLayout>
    );
}