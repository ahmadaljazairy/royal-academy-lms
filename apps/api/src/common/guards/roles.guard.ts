/**
 * @file Roles Authorization Guard
 * @module @royal-academy/api/common/guards/roles
 * @description Enforces Role-Based Access Control (RBAC) across controllers and route handlers
 * based on role metadata attached via `@Roles()`.
 */

import {
    Injectable,
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@royal-academy/types';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../interfaces/index.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // -------------------------------------------------------------------------
        // 1. Bypass role evaluation if route or controller is marked @Public()
        // -------------------------------------------------------------------------
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // -------------------------------------------------------------------------
        // 2. Extract required roles from route metadata (@Roles(...))
        // -------------------------------------------------------------------------
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Allow authenticated traffic through if no role constraints are defined
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // -------------------------------------------------------------------------
        // 3. Extract user session context from request
        // -------------------------------------------------------------------------
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException(
                'Authentication required: Active user session not found.',
            );
        }

        if (!user.role) {
            throw new ForbiddenException(
                'Access denied: User session lacks assigned role claims.',
            );
        }

        // -------------------------------------------------------------------------
        // 4. Verify role authorization match
        // -------------------------------------------------------------------------
        const hasRequiredRole = requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                `Forbidden resource: Requires one of the following roles: [${requiredRoles.join(', ')}]`,
            );
        }

        return true;
    }
}