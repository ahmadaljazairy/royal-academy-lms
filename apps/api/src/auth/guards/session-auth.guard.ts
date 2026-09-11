import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SESSION_COOKIE_NAME } from '../auth.constants.js';
import type { UserSession } from '@template/types';
import  {SessionService} from "../../common/security/session.service.js";
import {IS_PUBLIC_KEY} from "../../common/decorators/public.decorator.js";

export interface AuthenticatedRequest extends Request {
    user: UserSession;
    sessionId: string;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sessionService: SessionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

        if (!sessionId) {
            throw new UnauthorizedException(
                'Authentication required. No active session found.',
            );
        }

        const session = await this.sessionService.getSession(sessionId);

        if (!session) {
            throw new UnauthorizedException('Session is invalid or has expired.');
        }

        request.user = session;
        request.sessionId = sessionId;

        return true;
    }
}