import type {
    ApiSuccessResponse,
    ApiErrorResponse,
    UserProfile,
    UserSession,
    LogoutResult,
    LoginInput,
    RegisterInput,
} from '@template/types';

// Feature-scoped helper for native fetch
async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Enforces transmission of the 'sid' session cookie
    });

    const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

    if (!response.ok || !body.success) {
        const errorBody = body as ApiErrorResponse;
        const message = Array.isArray(errorBody.message)
            ? errorBody.message.join(', ')
            : errorBody.message || 'Authentication request failed';
        throw new Error(message);
    }

    return body.data;
}

export const authApi = {
    register: (data: RegisterInput) =>
        authFetch<UserProfile>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: LoginInput) =>
        authFetch<UserProfile>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getProfile: () =>
        authFetch<UserSession>('/api/auth/me', {
            method: 'GET',
        }),

    logout: () =>
        authFetch<LogoutResult>('/api/auth/logout', {
            method: 'POST',
        }),
};