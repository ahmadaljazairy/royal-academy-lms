// apps/api/src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { LoginInput } from '@template/types';

export class LoginDto implements LoginInput {
    @ApiProperty({
        example: 'academy.student@domain.com',
        description: 'Registered user email address',
        format: 'email',
    })
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty({ message: 'Email address is required.' })
    email!: string;

    @ApiProperty({
        example: 'SecurePassword2026!',
        description: 'Plaintext password for verification',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    password!: string;
}