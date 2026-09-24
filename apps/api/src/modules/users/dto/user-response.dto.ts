import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
    UserProfileResponse,
    PublicProfileResponse,
    PresignedPostUploadResponse,
    ConfirmAvatarUploadResponse,
    ChangePasswordResponse, ApiSuccessResponse,
} from '@template/types';

export class UserProfileDataDto implements UserProfileResponse {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    userId!: string;

    @ApiProperty({ example: 'student@royalacademy.com' })
    email!: string;

    @ApiProperty({ example: 'Alex Morgan' })
    displayName!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

    @ApiProperty({ example: true })
    isEmailVerified!: boolean;

    @ApiPropertyOptional({ example: 'Full Stack Engineer & Cloud Instructor', nullable: true })
    headline!: string | null;

    @ApiPropertyOptional({ example: 'Passionate about distributed systems.', nullable: true })
    bio!: string | null;

    @ApiPropertyOptional({ example: 'http://127.0.0.1:9000/royal-academy-public/avatars/user-123.png', nullable: true })
    avatarUrl!: string | null;

    @ApiPropertyOptional({ example: '+962791234567', nullable: true })
    phoneNumber!: string | null;

    @ApiPropertyOptional({ example: 'https://alexmorgan.dev', nullable: true })
    websiteUrl!: string | null;

    @ApiPropertyOptional({ example: 'https://github.com/alexmorgan', nullable: true })
    githubUrl!: string | null;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexmorgan', nullable: true })
    linkedinUrl!: string | null;

    @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-09-18T15:30:00.000Z' })
    updatedAt!: string;
}

export class PublicProfileDataDto implements PublicProfileResponse {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    userId!: string;

    @ApiProperty({ example: 'Alex Morgan' })
    displayName!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

    @ApiPropertyOptional({ example: 'Full Stack Engineer & Cloud Instructor', nullable: true })
    headline!: string | null;

    @ApiPropertyOptional({ example: 'Passionate about distributed systems.', nullable: true })
    bio!: string | null;

    @ApiPropertyOptional({ example: 'http://127.0.0.1:9000/royal-academy-public/avatars/user-123.png', nullable: true })
    avatarUrl!: string | null;

    @ApiPropertyOptional({ example: 'https://alexmorgan.dev', nullable: true })
    websiteUrl!: string | null;

    @ApiPropertyOptional({ example: 'https://github.com/alexmorgan', nullable: true })
    githubUrl!: string | null;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexmorgan', nullable: true })
    linkedinUrl!: string | null;
}

export class PresignedPostUploadDataDto implements PresignedPostUploadResponse {
    @ApiProperty({ example: 'http://127.0.0.1:9000/royal-academy-public' })
    uploadUrl!: string;

    @ApiProperty({
        example: {
            key: 'avatars/usr_123-1788703200-abcd1234.png',
            bucket: 'royal-academy-public',
            'Content-Type': 'image/png',
            policy: 'eyJleHBpcmF0aW9uIjoiMjAyNi0wOS...',
            'x-amz-signature': 'a1b2c3d4...',
        },
        description: 'S3 form fields that MUST precede the file payload in multipart/form-data',
    })
    fields!: Record<string, string>;

    @ApiProperty({ example: 'avatars/usr_123-1788703200-abcd1234.png' })
    fileKey!: string;

    @ApiProperty({ example: 'royal-academy-public' })
    bucket!: string;

    @ApiProperty({ example: 900, description: 'Ticket validity in seconds (15 minutes)' })
    expiresInSeconds!: number;
}

export class ConfirmAvatarUploadDataDto implements ConfirmAvatarUploadResponse {
    @ApiProperty({ example: 'http://127.0.0.1:9000/royal-academy-public/avatars/usr_123-1788703200-abcd1234.png' })
    avatarUrl!: string;
}

export class ChangePasswordDataDto implements ChangePasswordResponse {
    @ApiProperty({ example: 'Password successfully changed. Other sessions revoked.' })
    message!: string;
}
// =========================================================================
// STANDARD SUCCESS ENVELOPES (implements ApiSuccessResponse<T>)
// =========================================================================

export class UserProfileEnvelopeDto implements ApiSuccessResponse<UserProfileResponse> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'User profile retrieved successfully' })
    message!: string;

    @ApiProperty({ type: () => UserProfileDataDto })
    data!: UserProfileDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-21T14:48:00.000Z' })
    timestamp!: string;
}

export class PublicProfileEnvelopeDto implements ApiSuccessResponse<PublicProfileResponse> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Public profile retrieved successfully' })
    message!: string;

    @ApiProperty({ type: () => PublicProfileDataDto })
    data!: PublicProfileDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-21T14:48:00.000Z' })
    timestamp!: string;
}

export class AvatarUploadTicketEnvelopeDto implements ApiSuccessResponse<PresignedPostUploadResponse> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Avatar upload ticket generated successfully' })
    message!: string;

    @ApiProperty({ type: () => PresignedPostUploadDataDto })
    data!: PresignedPostUploadDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-21T14:48:00.000Z' })
    timestamp!: string;
}

export class ConfirmAvatarEnvelopeDto implements ApiSuccessResponse<ConfirmAvatarUploadResponse> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Avatar uploaded and verified successfully' })
    message!: string;

    @ApiProperty({ type: () => ConfirmAvatarUploadDataDto })
    data!: ConfirmAvatarUploadDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-21T14:48:00.000Z' })
    timestamp!: string;
}

export class ChangePasswordEnvelopeDto implements ApiSuccessResponse<ChangePasswordResponse> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Password changed successfully. Other sessions revoked.' })
    message!: string;

    @ApiProperty({ type: () => ChangePasswordDataDto })
    data!: ChangePasswordDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-21T14:48:00.000Z' })
    timestamp!: string;
}