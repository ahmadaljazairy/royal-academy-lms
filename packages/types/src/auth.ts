import type {SystemRole} from "./user.js";

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: SystemRole;
    isEmailVerified: boolean;
}

export type AuthUserResponse = UserProfile;

export interface UserSession {
    userId: string;
    email: string;
    role: SystemRole;
    createdAt: number;
}

export interface RegisterInput {
    email: string;
    password: string;
    displayName: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LogoutResult {
    loggedOut: boolean;
}