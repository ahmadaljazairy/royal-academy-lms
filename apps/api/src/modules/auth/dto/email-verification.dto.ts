import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ description: 'Raw verification token received via email' })
    @IsString()
    @IsNotEmpty()
    token!: string;
}

export class ResendVerificationDto {
    @ApiProperty({ example: 'student@domain.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}