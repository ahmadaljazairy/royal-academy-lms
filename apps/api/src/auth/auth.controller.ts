import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus, Inject, Get, UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
import { ResponseMessage } from '../common/decorators/response.decorators.js';
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from './auth.constants.js';
import type {AuthUserResponse, UserSession} from '@template/types';
import {CurrentUser} from "./decorators/current-user.decorator.js";
import {RateLimitGuard} from "../common/guards/rate-limit.guard.js";
import {RateLimit} from "../common/decorators/rate-limit.decorator.js";
import {Public} from "../common/decorators/public.decorator.js";
import {Roles} from "../common/decorators/roles.decorator.js";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService)
        private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 3, ttlSeconds: 60, keyPrefix: 'rl:register' })
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Account registered successfully')
    async register(@Body() dto: RegisterDto): Promise<AuthUserResponse> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'rl:login', trackEmail: true })
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Login successful')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AuthUserResponse> {
        const { session, user } = await this.authService.login(dto);

        // Set the HttpOnly session cookie
        response.cookie(
            SESSION_COOKIE_NAME,
            session.sessionId,
            getSessionCookieOptions(),
        );

        return user;
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Logged out successfully')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ loggedOut: boolean }> {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

        if (sessionId) {
            await this.authService.logout(sessionId);
        }

        // Clear the cookie using the exact same path and domain specs
        const cookieOptions = getSessionCookieOptions();
        response.clearCookie(SESSION_COOKIE_NAME, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            path: cookieOptions.path,
        });

        return { loggedOut: true };
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Authenticated profile retrieved')
    async getProfile(@CurrentUser() user: UserSession): Promise<UserSession> {
        return user;
    }

    // TESTING : Automatically protected by SessionAuthGuard + evaluated by RolesGuard
    @Get('admin-check')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Admin resource accessed successfully')
    async checkAdminAccess(): Promise<{ access: boolean }> {
        return { access: true };
    }
}