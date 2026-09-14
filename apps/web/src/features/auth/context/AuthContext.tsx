import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {UserSession, LoginInput, RegisterInput, UserProfile} from '@template/types';
import { authApi, AuthApiError } from '../api/auth.api';

interface AuthContextValue {
    user: UserSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (input: LoginInput) => Promise<UserProfile>;
    register: (input: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        try {
            const session = await authApi.getProfile();
            setUser(session);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const login = async (input: LoginInput): Promise<UserProfile> => {
        const profile = await authApi.login(input);

        try {
            const session = await authApi.getProfile();
            setUser(session);
        } catch {
            setUser(null);
            throw new Error('Session could not be established. Please check cookie settings.');
        }

        return profile;
    };

    const register = async (input: RegisterInput) => {
        await authApi.register(input);
        await refreshSession();
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: Boolean(user),
                login,
                register,
                logout,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { AuthApiError };