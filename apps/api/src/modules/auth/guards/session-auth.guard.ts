/**
 * @file Stateful Session Authentication Guard
 * @module @template/api/modules/auth/guards/session-auth
 * @description Authenticates incoming HTTP requests by validating stateful session IDs
 * against Redis via `SessionCacheRepository`.
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
import {SessionCacheRepository} from "../cache/session-cache.repository.js";

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sessionCache: SessionCacheRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // -------------------------------------------------------------------------
        // 1. Bypass evaluation if route or controller is decorated with @Public()
        // -------------------------------------------------------------------------
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();

        // -------------------------------------------------------------------------
        // 2. Extract and Sanitize Session ID from Cookie or Bearer Header
        // -------------------------------------------------------------------------
        const sessionId = this.extractSessionId(request);

        if (!sessionId) {
            throw new UnauthorizedException(
                'Authentication required. No active session found.',
            );
        }

        // -------------------------------------------------------------------------
        // 3. Fetch Session Payload from Redis via SessionCacheRepository
        // -------------------------------------------------------------------------
        const session = await this.sessionCache.getSession(sessionId);
        console.log('----------' + session)

        if (!session) {
            throw new UnauthorizedException(
                'Session is invalid or has expired.',
            );
        }

        // -------------------------------------------------------------------------
        // 4. Attach Session Payload and ID to AuthenticatedRequest
        // -------------------------------------------------------------------------
        const authReq = request as AuthenticatedRequest;
        authReq.user = session;
        authReq.sessionId = sessionId;

        return true;
    }

    /**
     * Safely extracts and sanitizes session IDs from HTTP cookies or Authorization headers.
     */
    private extractSessionId(request: Request): string | null {
        // Priority 1: Express Signed or Standard Cookies matching SESSION_COOKIE_NAME
        const cookieSessionId =
            request.signedCookies?.[SESSION_COOKIE_NAME] ||
            request.cookies?.[SESSION_COOKIE_NAME];

        if (cookieSessionId && typeof cookieSessionId === 'string') {
            return this.sanitizeSessionId(cookieSessionId);
        }

        // Priority 2: Authorization Header fallback (`Bearer <sessionId>`)
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            return token ? this.sanitizeSessionId(token) : null;
        }

        return null;
    }

    /**
     * Defense-in-depth: Sanitizes raw session tokens against CRLF, whitespace, or control characters.
     */
    private sanitizeSessionId(rawId: string): string {
        return rawId.replace(/[\r\n\s]/g, '').trim();
    }
}