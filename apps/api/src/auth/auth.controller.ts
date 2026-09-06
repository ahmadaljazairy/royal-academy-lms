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
import {SessionAuthGuard} from "./guards/session-auth.guard.js";
import {CurrentUser} from "./decorators/current-user.decorator.js";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService)
        private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Account registered successfully')
    async register(@Body() dto: RegisterDto): Promise<AuthUserResponse> {
        return this.authService.register(dto);
    }

    @Post('login')
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
    @UseGuards(SessionAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Authenticated profile retrieved')
    async getProfile(@CurrentUser() user: UserSession): Promise<UserSession> {
        return user;
    }
}