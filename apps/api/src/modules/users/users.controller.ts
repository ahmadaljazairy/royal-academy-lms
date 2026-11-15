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
    HttpStatus,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import type { Request } from 'express';

// -----------------------------------------------------------------------------
// Shared Monorepo Contracts
// -----------------------------------------------------------------------------
import type {
    ApiSuccessResponse,
    UserProfileResponse,
    PublicProfileResponse,
    PresignedPostUploadResponse,
    ConfirmAvatarUploadResponse,
    ChangePasswordResponse,
} from '@royal-academy/types';

// -----------------------------------------------------------------------------
// Cross-Cutting Common Utilities (Guards, Decorators, Interfaces)
// -----------------------------------------------------------------------------
import { Public } from '../../common/decorators/public.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { ApiDoc } from '../../common/decorators/api-doc.decorator.js';
import { RateLimitGuard } from '../../common/guards/index.js';
import type { AuthenticatedRequest } from '../../common/interfaces/index.js';

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
    UserProfileDataDto,
    PublicProfileDataDto,
    PresignedPostUploadDataDto,
    ConfirmAvatarUploadDataDto,
    ChangePasswordDataDto,
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
     * Retrieve full private profile information for the authenticated session owner.
     */
    @Get('me/profile')
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Get current user profile',
        description:
            'Retrieves the complete private profile for the authenticated session owner, including contact information and verification status.',
        status: HttpStatus.OK,
        message: 'User profile retrieved successfully',
        type: UserProfileDataDto,
        errors: [HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    })
    async getMeProfile(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiSuccessResponse<UserProfileResponse>> {
        const profile = await this.usersService.getMeProfile(userId);
        return profile as unknown as ApiSuccessResponse<UserProfileResponse>;
    }

    /**
     * Partially update profile attributes and synchronize display name.
     */
    @Patch('me/profile')
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Update profile details and display name',
        description:
            'Partially updates editable user fields (headline, bio, social links, phone) and persists changes to the user display name.',
        status: HttpStatus.OK,
        message: 'User profile updated successfully',
        type: UserProfileDataDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.NOT_FOUND,
        ],
    })
    async updateMeProfile(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateProfileDto,
    ): Promise<ApiSuccessResponse<UserProfileResponse>> {
        const updatedProfile = await this.usersService.updateMeProfile(
            userId,
            dto,
        );
        return updatedProfile as unknown as ApiSuccessResponse<UserProfileResponse>;
    }

    // ===========================================================================
    // 2. AVATAR STORAGE LIFECYCLE (PRESIGNED POST & VERIFICATION)
    // ===========================================================================

    /**
     * Issue an expiring S3 Presigned POST upload policy for an avatar image.
     */
    @Post('me/avatar/upload-url')
    @ApiCookieAuth('session-cookie')
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        targetLimit: 5,
        ttlSeconds: 60,
        keyPrefix: 'users:avatar-upload',
        keyResolver: (req) => (req as AuthenticatedRequest).user?.userId,    })
    @ApiDoc({
        summary: 'Request presigned POST upload policy for avatar',
        description:
            'Generates a signed S3 Presigned POST ticket enforcing byte-length bounds and locked MIME types.',
        status: HttpStatus.OK,
        message: 'Avatar upload ticket generated successfully',
        type: PresignedPostUploadDataDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.TOO_MANY_REQUESTS,
        ],
    })
    async requestAvatarUpload(
        @CurrentUser('userId') userId: string,
        @Body() dto: RequestAvatarUploadDto,
    ): Promise<ApiSuccessResponse<PresignedPostUploadResponse>> {
        const ticket = await this.usersService.requestAvatarUploadTicket(
            userId,
            dto,
        );
        return ticket as unknown as ApiSuccessResponse<PresignedPostUploadResponse>;
    }

    /**
     * Confirm and inspect avatar upload in storage, purge old avatar, and save URL.
     */
    @Post('me/avatar/complete')
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Confirm and inspect avatar upload in storage',
        description:
            'Validates fileKey ownership against session userId (IDOR prevention), inspects storage headers, cleans up previous avatars, and persists new avatarUrl.',
        status: HttpStatus.OK,
        message: 'Avatar uploaded and verified successfully',
        type: ConfirmAvatarUploadDataDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.FORBIDDEN,
            HttpStatus.NOT_FOUND,
        ],
    })
    async confirmAvatarUpload(
        @CurrentUser('userId') userId: string,
        @Body() dto: ConfirmAvatarUploadDto,
    ): Promise<ApiSuccessResponse<ConfirmAvatarUploadResponse>> {
        const result = await this.usersService.confirmAvatarUpload(userId, dto);
        return result as unknown as ApiSuccessResponse<ConfirmAvatarUploadResponse>;
    }

    // ===========================================================================
    // 3. ACCOUNT SECURITY & CREDENTIAL ROTATION
    // ===========================================================================

    /**
     * Authenticated password change with automatic revocation of other active sessions.
     */
    @Post('me/change-password')
    @ApiCookieAuth('session-cookie')
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        targetLimit: 5,
        ttlSeconds: 60,
        keyPrefix: 'users:change-password',
        keyResolver: (req) => (req as AuthenticatedRequest).user?.userId,    })
    @ApiDoc({
        summary: 'Change password and revoke other active sessions',
        description:
            'Verifies current password via Argon2id, hashes new credentials, updates database, and purges all other active sessions from Redis while preserving the current session.',
        status: HttpStatus.OK,
        message: 'Password changed successfully. Other sessions revoked.',
        type: ChangePasswordDataDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.NOT_FOUND,
            HttpStatus.TOO_MANY_REQUESTS,
        ],
    })
    async changePassword(
        @CurrentUser('userId') userId: string,
        @Req() req: Request,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
        @Body() dto: ChangePasswordDto,
    ): Promise<ApiSuccessResponse<ChangePasswordResponse>> {
        const authReq = req as AuthenticatedRequest;
        const activeSessionId =
            authReq.sessionId ??
            (req.cookies?.[SESSION_COOKIE_NAME] as string | undefined);

        if (!activeSessionId) {
            throw new UnauthorizedException(
                'Active session could not be resolved.',
            );
        }

        const result = await this.usersService.changePassword(
            userId,
            activeSessionId,
            dto,
            { ipAddress, userAgent },
        );
        return result as unknown as ApiSuccessResponse<ChangePasswordResponse>;
    }

    // ===========================================================================
    // 4. PUBLIC PROFILE DISCOVERY
    // ===========================================================================

    /**
     * Public profile discovery endpoint (unauthenticated).
     */
    @Public()
    @Get(':userId/profile')
    @ApiDoc({
        summary: 'Get public-facing user profile',
        description:
            'Retrieves sanitized public-facing profile metadata (displayName, headline, bio, avatar, social links).',
        status: HttpStatus.OK,
        message: 'Public profile retrieved successfully',
        type: PublicProfileDataDto,
        errors: [HttpStatus.NOT_FOUND],
    })
    async getPublicProfile(
        @Param('userId') userId: string,
    ): Promise<ApiSuccessResponse<PublicProfileResponse>> {
        const profile = await this.usersService.getPublicProfile(userId);
        return profile as unknown as ApiSuccessResponse<PublicProfileResponse>;
    }
}