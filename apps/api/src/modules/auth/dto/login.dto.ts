/**
 * @file Login DTO
 * @module auth/dto/login
 * @description Validates and normalizes credentials submitted for authentication.
 */

import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';
import type { LoginInput } from '@royal-academy/types';

/**
 * Credentials required to authenticate a registered user.
 */
export class LoginDto implements LoginInput {
    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Registered user email address.',
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
        description: 'Plaintext account password.',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
    })
    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @MaxLength(128, {
        message: 'Password cannot exceed 128 characters.',
    })
    password!: string;

    @ApiPropertyOptional({
        example: true,
        default: false,
        description: 'Whether the session should persist across browser restarts.',
    })
    @IsOptional()
    @IsBoolean({
        message: 'Remember-me preference must be a boolean value.',
    })
    rememberMe?: boolean;
}