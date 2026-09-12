import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { ComponentTestPage } from '@/app/pages/ComponentTestPage';
import { Spinner } from '@/shared/components/ui';
import {LandingPage} from "@/features/landing/pages/LandingPage";

import {LoginPage, RegisterPage} from "@/features/auth";
import {PrivacyPolicyPage, TermsOfServicePage} from "@/features/legal";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Spinner size="lg" className="text-primary" />
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Spinner size="lg" className="text-primary" />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    {/* Public Auth Routes (Redirect to /dashboard if already logged in) */}
                    <Route
                        path="/login"
                        element={
                            <PublicAuthRoute>
                                <LoginPage />
                            </PublicAuthRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicAuthRoute>
                                <RegisterPage />
                            </PublicAuthRoute>
                        }
                    />

                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />

                    {/* Protected Routes (Require active Redis session cookie) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Playground / Sandbox */}
                    <Route path="/test-components" element={<ComponentTestPage />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}