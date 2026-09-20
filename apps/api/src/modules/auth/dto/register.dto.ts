// apps/api/src/auth/dto/register.dto.ts
import {IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean, Equals} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RegisterInput } from '@template/types';

export class RegisterDto implements RegisterInput {
    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Unique email address for authentication',
        format: 'email',
    })
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty({ message: 'Email address is required.' })
    email!: string;

    @ApiProperty({
        example: 'SecurePassword2026!',
        description: 'Argon2id password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password!: string;

    @ApiProperty({
        example: 'Ahmad Aljazairy',
        description: 'User display name (2 to 50 characters)',
        minLength: 2,
        maxLength: 50,
    })
    @IsString({ message: 'displayName must be a string' })
    @MinLength(2, { message: 'Display name must be at least 2 characters.' })
    @MaxLength(50, { message: 'Display name cannot exceed 50 characters.' })
    displayName!: string;

    @ApiProperty({
        description: 'Legal acknowledgment and acceptance of terms and privacy policy',
        example: true,
    })
    @IsBoolean({ message: 'termsAccepted must be a boolean value.' })
    @Equals(true, {
        message: 'You must accept the terms of service and privacy policy to register.',
    })
    termsAccepted!: boolean;
}