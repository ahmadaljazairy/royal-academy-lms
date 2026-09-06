import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '../../security/session.service.js';
import { SESSION_COOKIE_NAME } from '../auth.constants.js';
import type { UserSession } from '@template/types';

export interface AuthenticatedRequest extends Request {
    user: UserSession;
    sessionId: string;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(private readonly sessionService: SessionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

        if (!sessionId) {
            throw new UnauthorizedException('Authentication required. No active session found.');
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