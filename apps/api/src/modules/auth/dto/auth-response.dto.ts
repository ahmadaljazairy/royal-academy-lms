/**
 * @file Authentication Response DTOs
 * @module @royal-academy/api/modules/auth/dto/auth-response
 * @description OpenAPI models for authentication response payloads.
 */

import { ApiProperty } from '@nestjs/swagger';
import {
    ROLES,
    type AuthUser,
    type LogoutResponse,
    type Role,
} from '@royal-academy/types';

/**
 * Public authenticated-user response payload (`register`, `login`, `me`).
 */
export class AuthUserResponseDto implements AuthUser {
    @ApiProperty({
        example: 'usr_cm1349f82000008l07b60g5d7',
        description: 'Unique user identifier.',
    })
    id!: string;

    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Primary user email address.',
        format: 'email',
    })
    email!: string;

    @ApiProperty({
        example: 'Ahmad Aljazairy',
        description: 'Full display name.',
    })
    displayName!: string;

    @ApiProperty({
        example: 'STUDENT',
        description: 'System authorization role.',
        enum: ROLES,
        enumName: 'Role',
    })
    role!: Role;

    @ApiProperty({
        example: false,
        description: 'Whether ownership of the email address has been verified.',
    })
    isEmailVerified!: boolean;
}

/**
 * Successful logout response payload.
 */
export class LogoutResponseDto implements LogoutResponse {
    @ApiProperty({
        example: true,
        description: 'Whether the server-side session was invalidated.',
    })
    loggedOut!: boolean;
}

/**
 * Successful email verification response payload.
 */
export class VerifyEmailResponseDto {
    @ApiProperty({
        example: true,
        description: 'Whether the email address was verified successfully.',
    })
    verified!: boolean;
}

/**
 * Administrative RBAC verification response payload.
 */
export class AdminCheckResponseDto {
    @ApiProperty({
        example: true,
        description: 'Confirms administrative access privileges.',
    })
    access!: boolean;
}

/**
 * Generic informational message payload for anti-enumeration and password reset endpoints.
 */
export class AuthMessageResponseDto {
    @ApiProperty({
        example: 'Operation completed successfully.',
        description: 'Human-readable status message.',
    })
    message!: string;
}