/**
 * @file Password Reset DTOs
 * @module auth/dto/password-reset
 * @description Validates password-recovery and password-reset requests.
 */

import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Input required to request a password-reset email.
 */
export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email address associated with the account.',
        example: 'student@royalacademy.com',
        format: 'email',
        maxLength: 254,
    })
    @Transform(({ value }): unknown =>
        typeof value === 'string'
            ? value.trim().toLowerCase()
            : value,
    )
    @IsEmail({}, {
        message: 'A valid email address is required.',
    })
    @IsNotEmpty({
        message: 'Email address is required.',
    })
    @MaxLength(254, {
        message: 'Email address cannot exceed 254 characters.',
    })
    email!: string;
}

/**
 * Input required to consume a password-reset token and establish a new
 * account password.
 */
export class ResetPasswordDto {
    @ApiProperty({
        description: 'Raw single-use password-reset token received by email.',
        example: '6d9c8f2a4e1b7d3c...',
        maxLength: 256,
        writeOnly: true,
    })
    @IsString({
        message: 'Password-reset token must be a string.',
    })
    @IsNotEmpty({
        message: 'Password-reset token is required.',
    })
    @MaxLength(256, {
        message: 'Password-reset token is invalid.',
    })
    token!: string;

    @ApiProperty({
        description: 'New plaintext password that will be hashed using Argon2id.',
        example: 'Str0ngP@ssw0rd!',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
    })
    @IsString({
        message: 'New password must be a string.',
    })
    @IsNotEmpty({
        message: 'New password is required.',
    })
    @MinLength(8, {
        message: 'Password must be at least 8 characters long.',
    })
    @MaxLength(128, {
        message: 'Password cannot exceed 128 characters.',
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    })
    newPassword!: string;
}