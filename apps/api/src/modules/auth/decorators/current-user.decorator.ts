import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserSession } from '@royal-academy/types';
import type {AuthenticatedRequest} from "../../../common/interfaces/index.js";

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