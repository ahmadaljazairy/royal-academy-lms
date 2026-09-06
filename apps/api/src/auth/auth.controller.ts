import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import type {Request, Response} from 'express';
import {AuthService} from './auth.service.js';
import {RegisterDto, LoginDto} from './dto/index.js';
import {
    AuthResponseEnvelopeDto,
    SessionResponseEnvelopeDto,
} from './dto/auth-response.dto.js';
import {ApiErrorResponseDto} from '../common/dto/api-response.dto.js';
import {ResponseMessage} from '../common/decorators/response.decorators.js';
import {RateLimit} from '../common/decorators/rate-limit.decorator.js';
import {RateLimitGuard} from '../common/guards/rate-limit.guard.js';
import {Public} from '../common/decorators/public.decorator.js';
import {Roles} from '../common/decorators/roles.decorator.js';
import {CurrentUser} from './decorators/current-user.decorator.js';
import {SESSION_COOKIE_NAME, getSessionCookieOptions} from './auth.constants.js';
import type {AuthUserResponse, UserSession} from '@template/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    // ---------------------------------------------------------------------------
    // POST /api/auth/register
    // ---------------------------------------------------------------------------
    @Public()
    @Post('register')
    @UseGuards(RateLimitGuard)
    @RateLimit({limit: 3, ttlSeconds: 60, keyPrefix: 'rl:register'})
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Account registered successfully')
    @ApiOperation({
        summary: 'Register a new user account',
        description: 'Hashes password with Argon2id and creates an unverified account. Rate-limited to 3 requests per 60 seconds.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully created.',
        type: AuthResponseEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description: 'Validation failed (e.g. malformed email or short password).',
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
    async register(@Body() dto: RegisterDto): Promise<AuthUserResponse> {
        return this.authService.register(dto);
    }

    // ---------------------------------------------------------------------------
    // POST /api/auth/login
    // ---------------------------------------------------------------------------
    @Public()
    @Post('login')
    @UseGuards(RateLimitGuard)
    @RateLimit({limit: 5, ttlSeconds: 60, keyPrefix: 'rl:login', trackEmail: true})
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Login successful')
    @ApiOperation({
        summary: 'Authenticate credentials and issue stateful session cookie',
        description: 'Verifies credentials via Argon2id, generates a secure random session ID stored in Redis, and sets a strict HttpOnly cookie.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Authentication successful. Sets the "sid" HttpOnly cookie.',
        type: AuthResponseEnvelopeDto,
        headers: {
            'Set-Cookie': {
                description: 'Secure session identifier cookie (sid=...; HttpOnly; SameSite=Lax; Path=/)',
                schema: {type: 'string'},
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
        @Res({passthrough: true}) response: Response,
    ): Promise<AuthUserResponse> {
        const {session, user} = await this.authService.login(dto);

        response.cookie(
            SESSION_COOKIE_NAME,
            session.sessionId,
            getSessionCookieOptions(),
        );

        return user;
    }

    // ---------------------------------------------------------------------------
    // GET /api/auth/me
    // ---------------------------------------------------------------------------
    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Authenticated profile retrieved')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Retrieve currently authenticated session data',
        description: 'Reads active session details from Redis using the incoming cookie identifier. Protected by global SessionAuthGuard.',
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

    // ---------------------------------------------------------------------------
    // POST /api/auth/logout
    // ---------------------------------------------------------------------------
    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Logged out successfully')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Terminate current session',
        description: 'Atomically evicts session record from Redis and clears the client session cookie. Safe and idempotent.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Session destroyed and cookie cleared.',
        schema: {
            type: 'object',
            properties: {
                success: {type: 'boolean', example: true},
                message: {type: 'string', example: 'Logged out successfully'},
                data: {
                    type: 'object',
                    properties: {loggedOut: {type: 'boolean', example: true}},
                },
                meta: {$ref: '#/components/schemas/ResponseMetaDto'},
            },
        },
    })
    async logout(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response,
    ): Promise<{ loggedOut: boolean }> {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

        if (sessionId) {
            await this.authService.logout(sessionId);
        }

        const cookieOptions = getSessionCookieOptions();
        response.clearCookie(SESSION_COOKIE_NAME, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            path: cookieOptions.path,
        });

        return {loggedOut: true};
    }

    // ---------------------------------------------------------------------------
    // GET /api/auth/admin-check
    // ---------------------------------------------------------------------------
    @Get('admin-check')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Admin resource accessed successfully')
    @ApiCookieAuth('session-cookie')
    @ApiOperation({
        summary: 'Verify administrative privileges',
        description: 'Demonstrates RBAC enforcement. Requires an active session and the ADMIN role.',
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
        return {access: true};
    }
}