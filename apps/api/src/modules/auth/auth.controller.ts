import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    HttpCode,
    Headers,
    HttpStatus,
    UseGuards, Ip,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiCookieAuth,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

// -----------------------------------------------------------------------------
// Shared Monorepo Contracts
// -----------------------------------------------------------------------------
import type {
    AuthUserResponse,
    UserSession,
    LogoutResult,
} from '@template/types';

// -----------------------------------------------------------------------------
// Cross-Cutting Common Utilities (Guards, Decorators, DTOs)
// -----------------------------------------------------------------------------
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { ResponseMessage } from '../../common/decorators/response.decorators.js';
import { ApiErrorResponseDto } from '../../common/dto/api-response.dto.js';

// -----------------------------------------------------------------------------
// Auth Domain Module Imports
// -----------------------------------------------------------------------------
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
    SESSION_COOKIE_NAME,
    getSessionCookieOptions,
} from './auth.constants.js';
import {
    RegisterDto,
    LoginDto,
    AuthResponseEnvelopeDto,
    SessionResponseEnvelopeDto,
    LogoutResponseEnvelopeDto, VerifyEmailDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto,
} from './dto/index.js';

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
     *
     * Rate-limited to 3 requests per 60s per IP to mitigate automated account
     * creation attacks and storage exhaustion.
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 3, ttlSeconds: 60, keyPrefix: 'rl:register' })
    @ResponseMessage('Account registered successfully')
    @ApiOperation({
        summary: 'Register a new user account',
        description:
            'Hashes password with Argon2id and creates an unverified account. Rate-limited to 3 requests per 60 seconds.',
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully created.',
        type: AuthResponseEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description: 'Validation failed (e.g., malformed email or short password).',
        type: ApiErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Email is already registered in the system.',
        type: ApiErrorResponseDto,
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (sliding window counter triggered).',
        type: ApiErrorResponseDto,
    })
    async register(
        @Body() dto: RegisterDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<AuthUserResponse> {
        return this.authService.register(dto, {ipAddress, userAgent});
    }

    /**
     * Authenticate user credentials and issue an HttpOnly stateful session cookie.
     *
     * Uses dual-dimensional rate limiting (IP + email) to mitigate credential
     * stuffing without locking out corporate networks behind shared NATs.
     *
     * @Res({ passthrough: true }) allows setting headers/cookies directly while
     * letting NestJS's TransformResponseInterceptor still format the response body.
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Public()
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'rl:login', trackEmail: true })
    @ResponseMessage('Login successful')
    @ApiOperation({
        summary: 'Authenticate credentials and issue stateful session cookie',
        description:
            'Verifies credentials via Argon2id, generates a secure random session ID stored in Redis, and sets a strict HttpOnly cookie.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Authentication successful. Sets the session cookie.',
        type: AuthResponseEnvelopeDto,
        headers: {
            'Set-Cookie': {
                description: 'Secure session identifier cookie (sid=...; HttpOnly; SameSite=Lax; Path=/)',
                schema: { type: 'string' },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation failed on email or password format.',
        type: ApiErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials provided.',
        type: ApiErrorResponseDto,
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (5 attempts per 60s per IP+email pair).',
        type: ApiErrorResponseDto,
    })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AuthUserResponse> {
        const { session, user } = await this.authService.login(dto);

        const cookieOptions = {
            ...getSessionCookieOptions(),
            ...(dto.rememberMe ? { expires: session.expiresAt } : {}),
        };

        if (!dto.rememberMe) {
            delete cookieOptions.maxAge;
        }

        response.cookie(
            SESSION_COOKIE_NAME,
            session.sessionId,
            cookieOptions,
        );

        return user;
    }

    /**
     * Terminate the current session.
     *
     * Decorated with `@Public()` to allow idempotent logouts even if a session
     * is already expired or missing from Redis.
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @Public()
    @ResponseMessage('Logged out successfully')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Terminate current session',
        description:
            'Atomically evicts the session record from Redis and clears the client session cookie. Safe and idempotent.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Session destroyed and cookie cleared.',
        type: LogoutResponseEnvelopeDto,
    })
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LogoutResult> {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

        if (sessionId) {
            await this.authService.logout(sessionId);
        }

        const { maxAge: _maxAge, expires: _expires, ...clearOptions } = getSessionCookieOptions();
        response.clearCookie(SESSION_COOKIE_NAME, clearOptions);

        return { loggedOut: true };
    }

    // ===========================================================================
    // 2. AUTHENTICATED SESSION & IDENTITY LIFECYCLE
    // ===========================================================================

    /**
     * Retrieve the active authenticated session profile.
     *
     * Implicitly guarded by the global SessionAuthGuard.
     * Uses `@CurrentUser()` parameter decorator to extract the hydrated
     * session payload attached to `request.user`.
     */
    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Authenticated profile retrieved')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Retrieve currently authenticated session data',
        description:
            'Reads active session details from Redis using the incoming cookie identifier. Protected by global SessionAuthGuard.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Session profile successfully fetched from Redis.',
        type: SessionResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Session cookie is missing, invalid, or expired.',
        type: ApiErrorResponseDto,
    })
    async getProfile(@CurrentUser() user: UserSession): Promise<UserSession> {
        return user;
    }

    // ===========================================================================
    // 3. TESTING : ROLE-BASED ACCESS CONTROL (RBAC VERIFICATION)
    // ===========================================================================

    /**
     * Verify administrative privileges.
     *
     * Evaluated by the global `RolesGuard` immediately following `SessionAuthGuard`.
     * Throws 401 if unauthenticated, or 403 if the user lacks the 'ADMIN' role.
     */
    @Get('admin-check')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    @ResponseMessage('Admin resource accessed successfully')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Verify administrative privileges',
        description:
            'Demonstrates RBAC enforcement. Requires an active session and the ADMIN role.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Access granted for administrator role.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthenticated (no active session).',
        type: ApiErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'Forbidden (authenticated user does not hold the ADMIN role).',
        type: ApiErrorResponseDto,
    })
    async checkAdminAccess(): Promise<{ access: boolean }> {
        return { access: true };
    }

    // ===========================================================================
    // 4. EMAIL VERIFICATION
    // ===========================================================================

    /**
     * Verify account email address using an ephemeral token.
     *
     * Consumes a single-use SHA-256 hashed token from Redis via atomic `GETDEL`.
     * Upon successful redemption, marks `isEmailVerified: true` in PostgreSQL.
     */
    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Email verified successfully')
    @ApiOperation({
        summary: 'Verify email address with ephemeral token',
        description:
            'Validates a raw 32-byte cryptographic token against Redis. Single-use and expires after 24 hours.',
    })
    @ApiBody({ type: VerifyEmailDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email verified successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Token is missing, malformed, expired, or already consumed.',
        type: ApiErrorResponseDto,
    })
    async verifyEmail(
        @Body() dto: VerifyEmailDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<{ verified : boolean }> {
        const verified = await this.authService.verifyEmail(dto.token, {
            ipAddress,
            userAgent,
        });

        return {verified};
    }

    /**
     * Resend account verification link.
     *
     * Anti-enumeration hardened: Always returns HTTP 200 regardless of whether
     * the email exists, is already verified, or was newly queued.
     *
     * Heavily rate limited (3 attempts per 15 minutes per IP + email) to prevent
     * spamming the background mail processor and user inboxes.
     */
    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 3, ttlSeconds: 900, keyPrefix: 'rl:resend-verif', trackEmail: true })
    @ResponseMessage('If the email is registered and unverified, a verification link has been sent.')
    @ApiOperation({
        summary: 'Resend verification link (Rate-limited, anti-enumeration safe)',
        description:
            'Re-issues a 24-hour verification token and queues an asynchronous email dispatch via BullMQ.',
    })
    @ApiBody({ type: ResendVerificationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Generic success envelope to mitigate account enumeration attacks.',
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (3 attempts per 15 minutes).',
        type: ApiErrorResponseDto,
    })
    async resendVerification(
        @Body() dto: ResendVerificationDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<{message : string}> {
        await this.authService.resendVerification(dto.email, {
            ipAddress,
            userAgent,
        });

        return {
            message:
                'If the email is registered and unverified, a verification link has been sent.',
        };
    }

    /**
     * Request password reset link.
     *
     * Protected with IP-level rate limiting (5 attempts / 15 mins) to prevent
     * queue starvation and email abuse.
     */
    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, ttlSeconds: 900, keyPrefix: 'rl:forgot-pw', trackEmail: false })
    @ResponseMessage('If an account exists with this email, a reset link has been sent.')
    @ApiOperation({
        summary: 'Request password reset link',
        description: 'Enqueues a password reset email if the account exists. Anti-enumeration protected.',
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Generic success envelope mitigating account enumeration.',
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded (5 requests per 15 minutes per IP).',
        type: ApiErrorResponseDto,
    })
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<{message : string}> {
        await this.authService.forgotPassword(dto.email, {
            ipAddress,
            userAgent,
        });

        return {
            message: 'If an account exists with this email, a reset link has been sent.',
        };
    }

    /**
     * Reset account password using ephemeral token.
     *
     * Atomically consumes the token, updates the password hash, and logs out all active sessions.
     */
    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Password reset successful. Please sign in with your new password.')
    @ApiOperation({
        summary: 'Reset password using token',
        description: 'Consumes the single-use reset token and revokes all active sessions for security.',
    })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password reset successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Token is invalid, expired, or password criteria not met.',
        type: ApiErrorResponseDto,
    })
    async resetPassword(
        @Body() dto: ResetPasswordDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<{ message : string }> {
        await this.authService.resetPassword(dto, {
            ipAddress,
            userAgent,
        });

        return {
            message: 'Password reset successful. Please sign in with your new password.',
        };
    }
}