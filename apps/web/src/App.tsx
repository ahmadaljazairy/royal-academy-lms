// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/shared/components/layout/ProtectedRoute';

// Auth Pages
import {
    LoginPage,
    RegisterPage,
    VerifyEmailPage,
    VerifyEmailPendingPage,
} from '@/features/auth/pages';

// Legal Pages
import { PrivacyPolicyPage, TermsOfServicePage } from '@/features/legal/pages';
import {LandingPage} from "@/features/landing/pages/LandingPage";

// Dummy / Placeholder Portal Components (replace with real pages when built)
function DashboardPage() {
    return <div className="p-8 text-xl font-bold">Student Dashboard</div>;
}

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

                    {/* ============================================================ */}
                    {/* 2. AUTHENTICATION & VERIFICATION FLOWS                       */}
                    {/* ============================================================ */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
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
                        <Route path="/admin" element={<AdminDashboardPage />} />
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