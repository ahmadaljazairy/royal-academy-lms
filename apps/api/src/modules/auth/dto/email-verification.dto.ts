/**
 * @file Email Verification DTOs
 * @module auth/dto/email-verification
 * @description Validates email-verification and verification-resend requests.
 */

import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Input required to verify ownership of an email address.
 */
export class VerifyEmailDto {
    @ApiProperty({
        description: 'Raw single-use verification token received by email.',
        example: '8f7c2e1a9d4b6c3f...',
        maxLength: 256,
        writeOnly: true,
    })
    @IsString({
        message: 'Verification token must be a string.',
    })
    @IsNotEmpty({
        message: 'Verification token is required.',
    })
    @MaxLength(256, {
        message: 'Verification token is invalid.',
    })
    token!: string;
}

/**
 * Input required to request another email-verification message.
 */
export class ResendVerificationDto {
    @ApiProperty({
        description: 'Email address associated with the pending account.',
        example: 'student@domain.com',
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