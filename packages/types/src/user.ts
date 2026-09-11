export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface BaseUser {
    id: string;
    email: string;
    displayName: string;
    profilePhoto: string | null;
    role: Role;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}