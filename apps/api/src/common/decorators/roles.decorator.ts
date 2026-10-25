/**
 * @file Roles Authorization Decorator
 * @module @royal-academy/api/modules/auth/decorators/roles.decorator
 * @description Custom metadata decorator used to attach required access control tiers
 * to route handlers or controllers for Role-Based Access Control (RBAC) evaluation.
 */

import { SetMetadata } from '@nestjs/common';
import type { Role } from '@royal-academy/types';

/**
 * Metadata key used by authorization guards to retrieve required user roles.
 */
export const ROLES_KEY = 'ROLES';

/**
 * Assigns one or more required user roles to a route handler or controller,
 * enabling RBAC guards to restrict access based on authenticated session claims.
 *
 * @param roles - List of allowed access control roles permitted to access the route
 *
 * @example
 * ```TypeScript
 * @Roles('ADMIN', 'INSTRUCTOR')
 * @Post('courses')
 * async createCourse() { ... }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);