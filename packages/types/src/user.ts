export type SystemRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface BaseUser {
    id: string;
    email: string;
    displayName: string;
    profilePhoto: string | null;
    role: SystemRole;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}