import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
    password!: string;

    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @MinLength(2, { message: 'Display name must be at least 2 characters.' })
    @MaxLength(50, { message: 'Display name cannot exceed 50 characters.' })
    displayName!: string;
}