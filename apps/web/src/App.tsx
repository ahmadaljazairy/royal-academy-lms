// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';

// Auth Pages
import {
    ForgotPasswordPage,
    LoginPage,
    RegisterPage, ResetPasswordPage,
    VerifyEmailPage,
    VerifyEmailPendingPage,
} from '@/features/auth/pages';

// Legal Pages
import { PrivacyPolicyPage, TermsOfServicePage } from '@/features/legal/pages';
import {LandingPage} from "@/features/landing/pages/LandingPage";
import {DashboardPage} from "@/app/pages/DashboardPage";
import {PublicOnlyRoute, ProtectedRoute} from "@/shared/components/layout";

function AdminDashboardPage() {
    return <div className="p-8 text-xl font-bold">Admin Management Console</div>;
}

function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h1>
            <a href="/" className="text-xs text-primary font-semibold hover:underline">
                Return to Home
            </a>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* ============================================================ */}
                    {/* 1. PUBLIC MARKETING & LEGAL ROUTES                           */}
                    {/* ============================================================ */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* ============================================================ */}
                    {/* 2. AUTHENTICATION & VERIFICATION FLOWS                       */}
                    {/* ============================================================ */}
                    {/* Guest-Only Routes (Bounces to /dashboard if already logged in) */}
                    <Route element={<PublicOnlyRoute redirectTo="/dashboard" />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />

                    {/* ============================================================ */}
                    {/* 3. STUDENT PORTAL (Authenticated + Verified Email)           */}
                    {/* ============================================================ */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        {/* Additional authenticated student routes go here:
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:id" element={<CoursePlayerPage />} />
                        */}
                    </Route>

                    {/* ============================================================ */}
                    {/* 4. ADMIN CONSOLE (Authenticated + Verified + ADMIN Role)     */}
                    {/* ============================================================ */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={['ADMIN']}
                                forbiddenRedirect="/dashboard"
                            />
                        }
                    >
                        <Route path="/admin" element={<DashboardPage />} />
                    </Route>

                    {/* ============================================================ */}
                    {/* 5. CATCH-ALL 404 ROUTE                                       */}
                    {/* ============================================================ */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;