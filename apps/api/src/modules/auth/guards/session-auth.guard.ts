/**
 * @file Stateful Session Authentication Guard
 * @module @royal-academy/api/modules/auth/guards/session-auth
 * @description Authenticates incoming HTTP requests by validating stateful session IDs
 * against Redis via `AuthCacheRepository`.
 */

import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../../../common/interfaces/index.js';
import { SESSION_COOKIE_NAME } from '../auth.constants.js';
import { AuthCacheRepository } from '../cache/auth-cache.repository.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authCache: AuthCacheRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const sessionId = this.extractSessionId(request);

        if (!sessionId) {
            throw new UnauthorizedException(
                'Authentication required. No active session found.',
            );
        }

        const session = await this.authCache.getSession(sessionId);

        if (!session) {
            throw new UnauthorizedException(
                'Session is invalid or has expired.',
            );
        }

        const authReq = request as AuthenticatedRequest;
        authReq.user = session;
        authReq.sessionId = sessionId;

        return true;
    }

    private extractSessionId(request: Request): string | null {
        const cookieSessionId =
            request.signedCookies?.[SESSION_COOKIE_NAME] ||
            request.cookies?.[SESSION_COOKIE_NAME];

        if (cookieSessionId && typeof cookieSessionId === 'string') {
            return this.sanitizeSessionId(cookieSessionId);
        }

        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            return token ? this.sanitizeSessionId(token) : null;
        }

        return null;
    }

    private sanitizeSessionId(rawId: string): string {
        return rawId.replace(/[\r\n\s]/g, '').trim();
    }
}