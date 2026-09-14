import type {
    ApiSuccessResponse,
    ApiErrorResponse,
    UserProfile,
    UserSession,
    LogoutResult,
    LoginInput,
    RegisterInput,
} from '@template/types';

export class AuthApiError extends Error {
    public readonly statusCode: number;
    public readonly error: string;
    public readonly traceId: string;
    public readonly messages: string[];

    constructor(payload: Partial<ApiErrorResponse>) {
        const raw = payload.message;
        const normalized = Array.isArray(raw)
            ? raw
            : [raw || 'An unexpected authentication error occurred'];

        super(normalized[0]);
        this.name = 'AuthApiError';
        this.statusCode = payload.statusCode ?? 500;
        this.error = payload.error ?? 'InternalServerError';
        this.traceId = payload.traceId ?? 'unassigned';
        this.messages = normalized;

        Object.setPrototypeOf(this, AuthApiError.prototype);
    }
}

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
        },
        // INVARIANT: Transmits and persists HttpOnly Redis 'sid' session cookies
        credentials: 'include',
    };

    const response = await fetch(endpoint, config);

    if (response.status === 204) {
        return {} as T;
    }

    let parsed: unknown;
    try {
        parsed = await response.json();
    } catch {
        throw new AuthApiError({
            statusCode: response.status,
            error: response.statusText || 'NetworkError',
            message: 'Failed to parse JSON response from server',
        });
    }

    if (!response.ok) {
        throw new AuthApiError(parsed as Partial<ApiErrorResponse>);
    }

    return (parsed as ApiSuccessResponse<T>).data;
}

export const authApi = {
    login: (input: LoginInput) =>
        authFetch<UserProfile>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(input),
        }),

    register: (input: RegisterInput) =>
        authFetch<UserProfile>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(input),
        }),

    getProfile: () =>
        authFetch<UserSession>('/api/auth/me', {
            method: 'GET',
        }),

    logout: () =>
        authFetch<LogoutResult>('/api/auth/logout', {
            method: 'POST',
        }),

    verifyEmail: (token: string) =>
        authFetch<{ verified: boolean }>('/api/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        }),

    resendVerification: (email: string) =>
        authFetch<{ message: string }>('/api/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
};