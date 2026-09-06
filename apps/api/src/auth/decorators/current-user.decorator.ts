import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/session-auth.guard.js';
import type { UserSession } from '@template/types';

export const CurrentUser = createParamDecorator(
    (data: keyof UserSession | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) {
            return null;
        }

        return data ? user[data] : user;
    },
);