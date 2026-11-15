/**
 * @file Current User Decorator
 * @module auth/decorators/current-user
 * @description Extracts the authenticated user session or a selected session property.
 */

import {
    createParamDecorator,
    type ExecutionContext,
} from '@nestjs/common';
import type {UserSession} from '@royal-academy/types';
import type {AuthenticatedRequest} from '../../../common/interfaces/index.js';

/**
 * Extracts the authenticated user session from the current HTTP request.
 *
 * A session property may be provided to return only that value.
 *
 * @example
 * ```ts
 * @CurrentUser() user: UserSession
 * @CurrentUser('userId') userId: string
 * ```
 *
 * @remarks
 * This decorator does not perform authentication. Protected routes must use
 * the appropriate authentication guard before accessing the current user.
 */
export const CurrentUser = createParamDecorator< keyof UserSession | undefined>(
    (
        property: keyof UserSession | undefined,
        context: ExecutionContext,
    ): UserSession[keyof UserSession] | UserSession | null => {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        const user = request.user;

        if (!user) {
            return null;
        }

        return property === undefined ? user : user[property];
    },
);