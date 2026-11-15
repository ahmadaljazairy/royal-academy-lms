/**
 * @file Registration DTO
 * @module auth/dto/register
 * @description Validates and normalizes new-account registration input.
 */

import { Transform } from 'class-transformer';
import {
    Equals,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RegisterInput } from '@royal-academy/types';

/**
 * Information required to register a new user account.
 */
export class RegisterDto implements RegisterInput {
    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Unique email address used for authentication.',
        format: 'email',
        maxLength: 254,
    })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty({ message: 'Email address is required.' })
    @MaxLength(254, {
        message: 'Email address cannot exceed 254 characters.',
    })
    email!: string;

    @ApiProperty({
        example: 'SecurePassword2026!',
        description: 'Plaintext password that will be hashed using Argon2id.',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
    })
    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(8, {
        message: 'Password must be at least 8 characters long.',
    })
    @MaxLength(128, {
        message: 'Password cannot exceed 128 characters.',
    })
    password!: string;

    @ApiProperty({
        example: 'Jack Jone',
        description: 'User-facing display name.',
        minLength: 2,
        maxLength: 50,
    })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString({ message: 'Display name must be a string.' })
    @IsNotEmpty({ message: 'Display name is required.' })
    @MinLength(2, {
        message: 'Display name must be at least 2 characters long.',
    })
    @MaxLength(50, {
        message: 'Display name cannot exceed 50 characters.',
    })
    displayName!: string;

    @ApiProperty({
        example: true,
        description: 'Acceptance of the terms of service and privacy policy.',
    })
    @IsBoolean({
        message: 'Terms acceptance must be a boolean value.',
    })
    @Equals(true, {
        message:
            'You must accept the terms of service and privacy policy to register.',
    })
    termsAccepted!: boolean;
}