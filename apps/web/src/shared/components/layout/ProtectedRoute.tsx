import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@template/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Spinner } from '@/shared/components/ui';

export interface ProtectedRouteProps {
    /** Explicit roles permitted to access this route. If omitted, any authenticated role is allowed. */
    allowedRoles?: Role[];
    /** Enforces whether email verification must be complete (defaults to true). */
    requireVerifiedEmail?: boolean;
    /** Fallback route when the user is unauthenticated (defaults to '/login'). */
    unauthenticatedRedirect?: string;
    /** Fallback route when the user lacks required RBAC permissions (defaults to '/dashboard'). */
    forbiddenRedirect?: string;
    /** Optional direct children fallback when not using layout-level <Outlet />. */
    children?: React.ReactNode;
}

export function ProtectedRoute({
                                   allowedRoles,
                                   requireVerifiedEmail = true,
                                   unauthenticatedRedirect = '/login',
                                   forbiddenRedirect = '/dashboard',
                                   children,
                               }: ProtectedRouteProps) {
    const location = useLocation();
    const { user, isLoading, isAuthenticated } = useAuth();

    // 1. Session Hydration / Loading Boundary
    if (isLoading) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-[#F8FAFC]"
            >
                <Spinner size="lg" className="text-[var(--color-primary)]" />
                <span className="text-xs font-medium text-slate-400 animate-pulse">
          Verifying security credentials...
        </span>
            </div>
        );
    }

    // 2. Authentication Perimeter: Captures intended location for post-login return
    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to={unauthenticatedRedirect}
                state={{ from: location }}
                replace
            />
        );
    }

    // 3. Email Verification Barrier
    // Note: Cast accounts for user models pending explicit isEmailVerified on UserSession
    const isVerified = (user as { isEmailVerified?: boolean }).isEmailVerified ?? false;

    if (requireVerifiedEmail && !isVerified) {
        return (
            <Navigate
                to="/verify-email-pending"
                state={{ email: user.email, from: location }}
                replace
            />
        );
    }

    // 4. Role-Based Access Control (RBAC) Perimeter
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={forbiddenRedirect}
                state={{ forbiddenFrom: location.pathname }}
                replace
            />
        );
    }

    // 5. Render Nested Layout (<Outlet />) or Direct Children
    return children ? <>{children}</> : <Outlet />;
}