import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type {ChangePasswordRequest} from "@template/types";

export class ChangePasswordDto implements ChangePasswordRequest{
    @ApiProperty({ example: 'CurrentPassword2026!' })
    @IsString()
    @MinLength(8)
    currentPassword!: string;

    @ApiProperty({ example: 'BrandNewSecurePassword2026!' })
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'newPassword must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
    })
    newPassword!: string;
}