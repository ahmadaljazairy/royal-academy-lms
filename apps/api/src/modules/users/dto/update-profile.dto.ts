import { Transform } from 'class-transformer';
import {
    IsString,
    IsOptional,
    MaxLength,
    IsUrl,
    Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateProfileRequest } from '@royal-academy/types';

export class UpdateProfileDto implements UpdateProfileRequest {
    @ApiPropertyOptional({ example: 'Alex Morgan', maxLength: 100 })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsString()
    @MaxLength(100)
    displayName?: string;

    @ApiPropertyOptional({
        example: 'Full Stack Engineer & Cloud Instructor',
        maxLength: 120,
    })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsString()
    @MaxLength(120)
    headline?: string;

    @ApiPropertyOptional({
        example:
            'Passionate software engineer building resilient distributed systems.',
    })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    bio?: string;

    @ApiPropertyOptional({ example: '+962791234567' })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'phoneNumber must be a valid E.164 phone number',
    })
    phoneNumber?: string;

    @ApiPropertyOptional({ example: 'https://alexmorgan.dev' })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsUrl({ require_protocol: true })
    websiteUrl?: string;

    @ApiPropertyOptional({ example: 'https://github.com/alexmorgan' })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsUrl({ require_protocol: true })
    githubUrl?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexmorgan' })
    @Transform(({ value }): unknown =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsOptional()
    @IsUrl({ require_protocol: true })
    linkedinUrl?: string;
}