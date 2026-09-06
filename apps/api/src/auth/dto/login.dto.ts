import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
        description: 'Plaintext password submitted for Argon2id verification',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    password!: string;
}