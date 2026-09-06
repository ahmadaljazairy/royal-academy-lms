import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../../auth/guards/session-auth.guard.js';
import type { SystemRole } from '@template/types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If route does not declare role constraints, allow authenticated traffic through
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: identity context missing.');
        }

        const hasRequiredRole = requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                `Forbidden resource: requires one of the following roles: [${requiredRoles.join(', ')}]`,
            );
        }

        return true;
    }
}