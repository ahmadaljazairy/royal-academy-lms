import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type {ConfirmAvatarUploadRequest} from "@royal-academy/types";

export class ConfirmAvatarUploadDto implements ConfirmAvatarUploadRequest{
    @ApiProperty({ example: 'avatars/cuid-1720000000-abcd1234.png' })
    @IsString()
    @IsNotEmpty()
    fileKey!: string;
}