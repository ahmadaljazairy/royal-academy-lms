import {
    IsString,
    IsOptional,
    MaxLength,
    IsUrl,
    Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type {UpdateProfileRequest} from "@template/types";

export class UpdateProfileDto implements UpdateProfileRequest{
    @ApiPropertyOptional({ example: 'Alex Morgan', maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    displayName?: string;

    @ApiPropertyOptional({ example: 'Full Stack Engineer & Cloud Instructor', maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    headline?: string;

    @ApiPropertyOptional({ example: 'Passionate software engineer building resilient distributed systems.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    bio?: string;

    @ApiPropertyOptional({ example: '+962791234567' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'phoneNumber must be a valid E.164 phone number',
    })
    phoneNumber?: string;

    @ApiPropertyOptional({ example: 'https://alexmorgan.dev' })
    @IsOptional()
    @IsUrl({ require_protocol: true })
    websiteUrl?: string;

    @ApiPropertyOptional({ example: 'https://github.com/alexmorgan' })
    @IsOptional()
    @IsUrl({ require_protocol: true })
    githubUrl?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexmorgan' })
    @IsOptional()
    @IsUrl({ require_protocol: true })
    linkedinUrl?: string;
}

