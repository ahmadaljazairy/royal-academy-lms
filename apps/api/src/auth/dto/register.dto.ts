import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Unique email address for account authentication',
        format: 'email',
    })
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty({ message: 'Email address is required.' })
    email!: string;

    @ApiProperty({
        example: 'SecurePassword2026!',
        description: 'Minimum 8-character password hashed with Argon2id',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password!: string;

    @ApiProperty({
        example: 'Ahmad Aljazairy',
        description: 'Display name between 2 and 50 characters',
        minLength: 2,
        maxLength: 50,
    })
    @IsString({ message: 'displayName must be a string' })
    @MinLength(2, { message: 'Display name must be at least 2 characters.' })
    @MaxLength(50, { message: 'Display name cannot exceed 50 characters.' })
    displayName!: string;
}