import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Spinner } from '@/shared/components/ui';

interface PublicOnlyRouteProps {
    redirectTo?: string;
}

export function PublicOnlyRoute({ redirectTo = '/dashboard' }: PublicOnlyRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Spinner size="lg" className="text-primary" />
            </div>
        );
    }

    if (isAuthenticated && user) {
        // If the user has a session but hasn't verified their email, send directly to pending screen
        if (!user.isEmailVerified) {
            return (
                <Navigate
                    to="/verify-email-pending"
                    state={{ email: user.email }}
                    replace
                />
            );
        }

        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}