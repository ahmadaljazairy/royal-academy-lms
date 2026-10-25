/**
 * @file Public Route Decorator
 * @module @royal-academy/api/modules/auth/decorators/public.decorator
 * @description Custom metadata decorator used to bypass global authentication guards
 * for publicly accessible API endpoints.
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by authentication guards to identify public endpoints.
 */
export const IS_PUBLIC_KEY = 'IS_PUBLIC';

/**
 * Marks a route handler or controller as publicly accessible, instructing
 * authentication guards to skip session or token verification.
 *
 * @example
 * ```TypeScript
 * @Public()
 * @Post('login')
 * async login(@Body() dto: LoginDto) { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);