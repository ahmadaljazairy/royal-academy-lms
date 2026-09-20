import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {RequestAvatarUploadRequest} from "@template/types";

export class RequestAvatarUploadDto implements RequestAvatarUploadRequest{
    @ApiProperty({ example: 'image/png' })
    @IsString()
    @IsNotEmpty()
    mimeType!: string;

    @ApiPropertyOptional({ example: 'avatar.png' })
    @IsOptional()
    @IsString()
    originalFilename?: string;
}