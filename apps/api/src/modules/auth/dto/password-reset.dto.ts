import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, Matches, MinLength} from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'student@royalacademy.com' })
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsNotEmpty()
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    email!: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'The raw 32-byte ephemeral reset token received in email' })
    @IsString()
    @IsNotEmpty()
    token!: string;

    @ApiProperty({ example: 'Str0ngP@ssw0rd!', minLength: 8 })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    })
    newPassword!: string;
}