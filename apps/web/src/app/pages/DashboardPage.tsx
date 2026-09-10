import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert, BrandLogo } from '@/shared/components/ui';

export function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [adminStatus, setAdminStatus] = useState<string | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleAdminCheck = async () => {
        setIsCheckingAdmin(true);
        setAdminStatus(null);
        setAdminError(null);

        try {
            const res = await fetch('/api/auth/admin-check', {
                credentials: 'include',
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `HTTP ${res.status}: Access Denied`);
            }
            setAdminStatus('Access Granted: You have verified ADMIN privileges.');
        } catch (err: unknown) {
            setAdminError((err as Error).message);
        } finally {
            setIsCheckingAdmin(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <BrandLogo size="md" />
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>

                {/* Session Status Banner */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Authenticated Session Active</CardTitle>
                                <CardDescription>
                                    Live Redis session authenticated via HttpOnly cookie (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">sid</code>).
                                </CardDescription>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                ● Live
              </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase">User ID</span>
                                <span className="font-mono text-slate-700 text-xs">{user?.userId || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase">Email</span>
                                <span className="font-semibold text-slate-900">{user?.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase">Assigned Role</span>
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded bg-slate-200 text-slate-800">
                  {user?.role || 'N/A'}
                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase">Session Created At</span>
                                <span className="text-slate-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                </span>
                            </div>
                        </div>

                        {/* Test RBAC Guard */}
                        <div className="pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Protected Route Verification
                            </h4>
                            <Button
                                variant="secondary"
                                size="sm"
                                isLoading={isCheckingAdmin}
                                onClick={handleAdminCheck}
                            >
                                Verify Admin Route (/api/auth/admin-check)
                            </Button>
                        </div>

                        {adminStatus && (
                            <Alert variant="success" title="RBAC Check Passed">
                                {adminStatus}
                            </Alert>
                        )}

                        {adminError && (
                            <Alert variant="error" title="RBAC Check Rejected">
                                {adminError}
                            </Alert>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between items-center text-xs text-slate-400">
                        <span>State synchronized with NestJS AllExceptionsFilter & TransformResponseInterceptor</span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}