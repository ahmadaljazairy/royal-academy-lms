import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    Param,
    Req,
    Ip,
    Headers,
    HttpCode,
    HttpStatus,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiCookieAuth,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

// -----------------------------------------------------------------------------
// Shared Monorepo Contracts
// -----------------------------------------------------------------------------
import type {
    UserProfileResponse,
    PublicProfileResponse,
    PresignedPostUploadResponse,
    ConfirmAvatarUploadResponse,
    ChangePasswordResponse,
} from '@template/types';

// -----------------------------------------------------------------------------
// Cross-Cutting Common Utilities (Guards, Decorators, DTOs)
// -----------------------------------------------------------------------------
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { ResponseMessage } from '../../common/decorators/response.decorators.js';
import { ApiErrorResponseDto } from '../../common/dto/api-response.dto.js';

// -----------------------------------------------------------------------------
// Auth & Identity Integration
// -----------------------------------------------------------------------------
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants.js';

// -----------------------------------------------------------------------------
// Users Domain Module Imports
// -----------------------------------------------------------------------------
import { UsersService } from './users.service.js';
import {
    UpdateProfileDto,
    RequestAvatarUploadDto,
    ConfirmAvatarUploadDto,
    ChangePasswordDto,
    UserProfileEnvelopeDto,
    PublicProfileEnvelopeDto,
    AvatarUploadTicketEnvelopeDto,
    ConfirmAvatarEnvelopeDto,
    ChangePasswordEnvelopeDto,
} from './dto/index.js';

/**
 * Controller managing private account profiles, public profile lookups,
 * secure S3 avatar provisioning, and authenticated password changes.
 *
 * NOTE: Session authentication is enforced globally via SessionAuthGuard.
 * Unauthenticated routes must be explicitly decorated with `@Public()`.
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // ===========================================================================
    // 1. AUTHENTICATED PROFILE MANAGEMENT
    // ===========================================================================

    /**
     * Retrieve current user profile.
     *
     * Fetches full private profile information for the authenticated session owner.
     */
    @Get('me/profile')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('session-cookie')
    @ResponseMessage('User profile retrieved successfully')
    @ApiOperation({
        summary: 'Get current user profile',
        description:
            'Retrieves the complete private profile for the authenticated session owner, including contact information and verification status.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profile retrieved successfully.',
        type: UserProfileEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Session cookie is missing, invalid, or expired.',
        type: ApiErrorResponseDto,
    })
    async getMeProfile(
        @CurrentUser('userId') userId: string,
    ): Promise<UserProfileResponse> {
        return this.usersService.getMeProfile(userId);
    }

    /**
     * Update current user profile.
     *
     * Partially updates profile attributes (headline, bio, social URLs, phone)
     * and synchronizes the display name on the user record.
     */
    @Patch('me/profile')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('session-cookie')
    @ResponseMessage('User profile updated successfully')
    @ApiOperation({
        summary: 'Update profile details and display name',
        description:
            'Partially updates editable user fields (headline, bio, social links, phone) and persists changes to the user display name.',
    })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profile updated successfully.',
        type: UserProfileEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description:
            'Validation failed on input fields (e.g., bio exceeds length or malformed URL).',
        type: ApiErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Session cookie is missing, invalid, or expired.',
        type: ApiErrorResponseDto,
    })
    async updateMeProfile(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateProfileDto,
    ): Promise<UserProfileResponse> {
        return this.usersService.updateMeProfile(userId, dto);
    }

    // ===========================================================================
    // 2. AVATAR STORAGE LIFECYCLE (PRESIGNED POST & VERIFICATION)
    // ===========================================================================

    /**
     * Request presigned POST upload policy for an avatar image.
     *
     * Issues an expiring signed policy enforcing exact byte ranges (1B - 5MB)
     * and supported MIME types directly at the object storage layer.
     */
    @Post('me/avatar/upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('session-cookie')
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'rl:avatar-upload' })
    @ResponseMessage('Avatar upload ticket generated successfully')
    @ApiOperation({
        summary: 'Request presigned POST upload policy for avatar',
        description:
            'Generates a signed S3 Presigned POST ticket enforcing hardware-level content-length-range (1B to 5MB) and locked MIME types. Rate limited to 5 requests per 60s.',
    })
    @ApiBody({ type: RequestAvatarUploadDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Upload policy generated successfully.',
        type: AvatarUploadTicketEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description:
            'Unsupported MIME type. Allowed formats: image/jpeg, image/png, image/webp.',
        type: ApiErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Session cookie is missing, invalid, or expired.',
        type: ApiErrorResponseDto,
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (5 requests per 60 seconds).',
        type: ApiErrorResponseDto,
    })
    async requestAvatarUpload(
        @CurrentUser('userId') userId: string,
        @Body() dto: RequestAvatarUploadDto,
    ): Promise<PresignedPostUploadResponse> {
        return this.usersService.requestAvatarUploadTicket(userId, dto);
    }

    /**
     * Confirm and inspect avatar upload in storage.
     *
     * Validates fileKey ownership against session userId (IDOR defense),
     * verifies object existence and metadata via HeadObject, purges old avatar,
     * and persists new public URL.
     */
    @Post('me/avatar/complete')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('session-cookie')
    @ResponseMessage('Avatar uploaded and verified successfully')
    @ApiOperation({
        summary: 'Confirm and inspect avatar upload in storage',
        description:
            'Validates fileKey ownership against session userId (IDOR prevention), inspects storage headers via HeadObjectCommand, cleans up previous avatars, and persists new avatarUrl.',
    })
    @ApiBody({ type: ConfirmAvatarUploadDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Avatar verified and profile updated.',
        type: ConfirmAvatarEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description: 'Physical file violates size bounds or MIME type on disk.',
        type: ApiErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Session cookie is missing, invalid, or expired.',
        type: ApiErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'Access denied: You cannot claim an asset you do not own.',
        type: ApiErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Object key not found in storage bucket.',
        type: ApiErrorResponseDto,
    })
    async confirmAvatarUpload(
        @CurrentUser('userId') userId: string,
        @Body() dto: ConfirmAvatarUploadDto,
    ): Promise<ConfirmAvatarUploadResponse> {
        return this.usersService.confirmAvatarUpload(userId, dto);
    }

    // ===========================================================================
    // 3. ACCOUNT SECURITY & CREDENTIAL ROTATION
    // ===========================================================================

    /**
     * Authenticated password change.
     *
     * Verifies current password using Argon2id, hashes the new password,
     * updates credentials in PostgreSQL, and revokes all other active sessions in Redis.
     */
    @Post('me/change-password')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('session-cookie')
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'rl:change-pw' })
    @ResponseMessage('Password changed successfully. Other sessions revoked.')
    @ApiOperation({
        summary: 'Change password and revoke other active sessions',
        description:
            'Verifies current password via Argon2id, hashes new credentials, updates database, and purges all other active sessions from Redis while preserving current session. Rate limited to 5 requests per 60s.',
    })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password changed successfully. Other sessions revoked.',
        type: ChangePasswordEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description:
            'Password complexity criteria not met or new password is identical to current password.',
        type: ApiErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Current password does not match or active session cannot be resolved.',
        type: ApiErrorResponseDto,
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (5 requests per 60 seconds).',
        type: ApiErrorResponseDto,
    })
    async changePassword(
        @CurrentUser('userId') userId: string,
        @Req() req: Request,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
        @Body() dto: ChangePasswordDto,
    ): Promise<ChangePasswordResponse> {
        const activeSessionId = req.cookies?.[SESSION_COOKIE_NAME] ?? req.cookies?.sid;

        if (!activeSessionId) {
            throw new UnauthorizedException('Active session could not be resolved.');
        }

        return this.usersService.changePassword(
            userId,
            activeSessionId,
            dto,
            { ipAddress, userAgent },
        );
    }

    // ===========================================================================
    // 4. PUBLIC PROFILE DISCOVERY
    // ===========================================================================

    /**
     * Public profile discovery endpoint.
     *
     * Accessible without an active session. Returns sanitized profile attributes.
     */
    @Public()
    @Get(':userId/profile')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Public profile retrieved successfully')
    @ApiOperation({
        summary: 'Get public-facing user profile',
        description:
            'Retrieves public-facing profile metadata (displayName, headline, bio, avatar, social links). Does not require an active session and excludes sensitive account details.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Public profile retrieved.',
        type: PublicProfileEnvelopeDto,
    })
    @ApiNotFoundResponse({
        description: 'Public profile not found for specified userId.',
        type: ApiErrorResponseDto,
    })
    async getPublicProfile(
        @Param('userId') userId: string,
    ): Promise<PublicProfileResponse> {
        return this.usersService.getPublicProfile(userId);
    }
}