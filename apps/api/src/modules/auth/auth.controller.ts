import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    Headers,
    HttpStatus,
    UseGuards,
    Ip,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';

// -----------------------------------------------------------------------------
// Shared Monorepo Contracts
// -----------------------------------------------------------------------------
import type {
    ApiSuccessResponse,
    AuthUserResponse,
    LogoutResponse,
} from '@royal-academy/types';

// -----------------------------------------------------------------------------
// Cross-Cutting Common Utilities (Guards, Decorators)
// -----------------------------------------------------------------------------
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { ApiDoc } from '../../common/decorators/api-doc.decorator.js';
import { RateLimitGuard } from '../../common/guards/index.js';

// -----------------------------------------------------------------------------
// Auth Domain Module Imports
// -----------------------------------------------------------------------------
import { AuthService } from './services/auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { AUTH_TTL } from './cache/auth-cache.contracts.js';
import {
    SESSION_COOKIE_NAME,
    getSessionCookieOptions,
    getClearSessionCookieOptions,
} from './auth.constants.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import {
    VerifyEmailDto,
    ResendVerificationDto,
} from './dto/email-verification.dto.js';
import {
    ForgotPasswordDto,
    ResetPasswordDto,
} from './dto/password-reset.dto.js';
import {
    AuthUserResponseDto,
    LogoutResponseDto,
    VerifyEmailResponseDto,
    AdminCheckResponseDto,
    AuthMessageResponseDto,
} from './dto/auth-response.dto.js';

/**
 * Controller handling user registration, authentication, stateful session
 * lifecycles (backed by Redis), and RBAC perimeter validation.
 *
 * NOTE: Secure-by-default is enforced globally via SessionAuthGuard.
 * Any route accessible without an active Redis session MUST be explicitly
 * decorated with `@Public()`.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // ===========================================================================
    // 1. PUBLIC AUTHENTICATION (PERIMETER PROTECTED)
    // ===========================================================================

    /**
     * Register a new user account.
     */
    @Post('register')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 5,
        targetLimit: 2,
        ttlSeconds: 60,
        keyPrefix: 'auth:register',
        keyResolver: (req) => req.body?.email,
    })
    @ApiDoc({
        summary: 'Register a new user account',
        description:
            'Creates a user record with an Argon2id password hash and enqueues a 24-hour email verification link.',
        status: HttpStatus.CREATED,
        message: 'Account registered successfully. Please verify your email.',
        type: AuthUserResponseDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.CONFLICT,
            HttpStatus.TOO_MANY_REQUESTS,
        ],
    })
    async register(
        @Body() dto: RegisterDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<ApiSuccessResponse<AuthUserResponse>> {
        const user = await this.authService.register(dto, {
            ipAddress,
            userAgent,
        });
        return user as unknown as ApiSuccessResponse<AuthUserResponse>;
    }

    /**
     * Authenticate user credentials and issue an HttpOnly stateful session cookie.
     */
    @Post('login')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 20,
        targetLimit: 5,
        ttlSeconds: 60,
        keyPrefix: 'auth:login',
        keyResolver: (req) => req.body?.email,
    })
    @ApiDoc({
        summary: 'Authenticate credentials and issue stateful session cookie',
        description:
            'Verifies credentials via Argon2id, creates a stateful session in Redis, and sets an HttpOnly session cookie (`sid`).',
        status: HttpStatus.OK,
        message: 'Login successful',
        type: AuthUserResponseDto,
        errors: [
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.TOO_MANY_REQUESTS,
        ],
    })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ApiSuccessResponse<AuthUserResponse>> {
        const { session, user } = await this.authService.login(dto);

        const ttlSeconds = dto.rememberMe
            ? AUTH_TTL.SESSION_REMEMBER_ME
            : AUTH_TTL.SESSION_STANDARD;

        response.cookie(
            SESSION_COOKIE_NAME,
            session.sessionId,
            getSessionCookieOptions(ttlSeconds * 1000),
        );

        return user as unknown as ApiSuccessResponse<AuthUserResponse>;
    }

    /**
     * Terminate the current session.
     * Decorated with `@Public()` so logouts remain safe and idempotent even if expired.
     */
    @Post('logout')
    @Public()
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Terminate current session',
        description:
            'Evicts the session record from Redis and clears the client session cookie. Safe and idempotent.',
        status: HttpStatus.OK,
        message: 'Logged out successfully',
        type: LogoutResponseDto,
    })
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ApiSuccessResponse<LogoutResponse>> {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as
            | string
            | undefined;

        if (sessionId) {
            await this.authService.logout(sessionId);
        }

        response.clearCookie(
            SESSION_COOKIE_NAME,
            getClearSessionCookieOptions(),
        );

        return { loggedOut: true } as unknown as ApiSuccessResponse<LogoutResponse>;
    }

    // ===========================================================================
    // 2. AUTHENTICATED SESSION & IDENTITY LIFECYCLE
    // ===========================================================================

    /**
     * Retrieve the currently authenticated user's profile.
     */
    @Get('me')
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Retrieve currently authenticated user profile',
        description:
            'Resolves the authenticated user profile for the active Redis session. Protected by global SessionAuthGuard.',
        status: HttpStatus.OK,
        message: 'Authenticated profile retrieved',
        type: AuthUserResponseDto,
        errors: [HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    })
    async getProfile(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiSuccessResponse<AuthUserResponse>> {
        const profile = await this.authService.getProfile(userId);
        return profile as unknown as ApiSuccessResponse<AuthUserResponse>;
    }

    // ===========================================================================
    // 3. ROLE-BASED ACCESS CONTROL (RBAC VERIFICATION)
    // ===========================================================================

    /**
     * Verify administrative privileges.
     */
    @Get('admin-check')
    @Roles('ADMIN')
    @ApiCookieAuth('session-cookie')
    @ApiDoc({
        summary: 'Verify administrative privileges',
        description:
            'Demonstrates RBAC enforcement. Requires an active session and the ADMIN role.',
        status: HttpStatus.OK,
        message: 'Admin resource accessed successfully',
        type: AdminCheckResponseDto,
        errors: [HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN],
    })
    async checkAdminAccess(): Promise<ApiSuccessResponse<AdminCheckResponseDto>> {
        return { access: true } as unknown as ApiSuccessResponse<AdminCheckResponseDto>;
    }

    // ===========================================================================
    // 4. EMAIL VERIFICATION & PASSWORD RECOVERY
    // ===========================================================================

    /**
     * Verify account email address using a single-use ephemeral token.
     */
    @Post('verify-email')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        ttlSeconds: 60,
        keyPrefix: 'auth:verify-email',
    })
    @ApiDoc({
        summary: 'Verify email address with ephemeral token',
        description:
            'Atomically consumes a single-use SHA-256 verification token from Redis (`GETDEL`) and marks the account verified.',
        status: HttpStatus.OK,
        message: 'Email verified successfully',
        type: VerifyEmailResponseDto,
        errors: [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS],
    })
    async verifyEmail(
        @Body() dto: VerifyEmailDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<ApiSuccessResponse<VerifyEmailResponseDto>> {
        const verified = await this.authService.verifyEmail(dto.token, {
            ipAddress,
            userAgent,
        });

        return { verified } as unknown as ApiSuccessResponse<VerifyEmailResponseDto>;
    }

    /**
     * Resend account verification link (anti-enumeration safe).
     */
    @Post('resend-verification')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        targetLimit: 3,
        ttlSeconds: 900,
        keyPrefix: 'auth:resend-verification',
        keyResolver: (req) => req.body?.email,
    })
    @ApiDoc({
        summary: 'Resend verification link (anti-enumeration safe)',
        description:
            'Re-issues a 24-hour verification token and queues an asynchronous email dispatch via BullMQ.',
        status: HttpStatus.OK,
        message:
            'If the email is registered and unverified, a verification link has been sent.',
        type: AuthMessageResponseDto,
        errors: [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS],
    })
    async resendVerification(
        @Body() dto: ResendVerificationDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<ApiSuccessResponse<AuthMessageResponseDto>> {
        await this.authService.resendVerification(dto.email, {
            ipAddress,
            userAgent,
        });

        return {
            message:
                'If the email is registered and unverified, a verification link has been sent.',
        } as unknown as ApiSuccessResponse<AuthMessageResponseDto>;
    }

    /**
     * Request password reset link (anti-enumeration safe).
     */
    @Post('forgot-password')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        targetLimit: 3,
        ttlSeconds: 900,
        keyPrefix: 'auth:forgot-password',
        keyResolver: (req) => req.body?.email,
    })
    @ApiDoc({
        summary: 'Request password reset link',
        description:
            'Enqueues a 1-hour password reset email if the account exists. Anti-enumeration protected.',
        status: HttpStatus.OK,
        message:
            'If an account exists with this email, a reset link has been sent.',
        type: AuthMessageResponseDto,
        errors: [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS],
    })
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<ApiSuccessResponse<AuthMessageResponseDto>> {
        await this.authService.forgotPassword(dto.email, {
            ipAddress,
            userAgent,
        });

        return {
            message:
                'If an account exists with this email, a reset link has been sent.',
        } as unknown as ApiSuccessResponse<AuthMessageResponseDto>;
    }

    /**
     * Reset account password using single-use ephemeral token.
     */
    @Post('reset-password')
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 10,
        ttlSeconds: 900,
        keyPrefix: 'auth:reset-password',
    })
    @ApiDoc({
        summary: 'Reset password using token',
        description:
            'Consumes the single-use reset token, hashes the new password with Argon2id, and revokes all active sessions.',
        status: HttpStatus.OK,
        message:
            'Password reset successful. Please sign in with your new password.',
        type: AuthMessageResponseDto,
        errors: [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS],
    })
    async resetPassword(
        @Body() dto: ResetPasswordDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<ApiSuccessResponse<AuthMessageResponseDto>> {
        await this.authService.resetPassword(dto, {
            ipAddress,
            userAgent,
        });

        return {
            message:
                'Password reset successful. Please sign in with your new password.',
        } as unknown as ApiSuccessResponse<AuthMessageResponseDto>;
    }
}