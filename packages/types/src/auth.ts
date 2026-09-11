import type {Role} from "./user.js";

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: Role;
    isEmailVerified: boolean;
}

export type AuthUserResponse = UserProfile;

export interface UserSession {
    userId: string;
    email: string;
    role: Role;
    createdAt: number;
}

export interface RegisterInput {
    email: string;
    password: string;
    displayName: string;
    termsAccepted: boolean;
}

export interface LoginInput {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LogoutResult {
    loggedOut: boolean;
}