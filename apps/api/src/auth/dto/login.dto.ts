import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'A valid email address is required.' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    password!: string;
}