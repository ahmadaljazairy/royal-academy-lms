import type { SystemRole } from './user.js';

export interface UserSession {
    userId: string;
    email: string;
    role: SystemRole;
    createdAt: number; // Unix timestamp in ms
}

export interface AuthUserResponse {
    id: string;
    email: string;
    displayName: string;
    role: SystemRole;
    isEmailVerified: boolean;
}