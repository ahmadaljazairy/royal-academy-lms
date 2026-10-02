/**
 * @file Response Transformation Decorators
 * @module @template/api/common/decorators/response
 * @description Custom route and controller metadata decorators consumed by
 * `TransformResponseInterceptor` to customize or bypass outgoing HTTP wire envelopes.
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key identifier for custom response messages.
 */
export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Attaches a custom human-readable message to the outgoing `ApiSuccessResponse` envelope.
 *
 * Used by `TransformResponseInterceptor` to override default HTTP status messages
 * (e.g., changing `"Resource created successfully"` to a specific domain notification).
 *
 * @param message - The human-readable message string to include in the response.
 * @returns A NestJS custom metadata decorator.
 *
 * @example
 * ```typescript
 * @Post('register')
 * @ResponseMessage('Registration successful. Please verify your email address.')
 * async register(@Body() dto: RegisterDto): Promise<UserResponse> {
 *   return this.authService.register(dto);
 * }
 * ```
 */
export const ResponseMessage = (message: string) =>
    SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * Metadata key identifier for bypassing response transformation.
 */
export const BYPASS_TRANSFORM_KEY = 'bypass_transform';

/**
 * Bypasses automatic `ApiSuccessResponse` / `ApiPaginatedResponse` wire envelope wrapping.
 *
 * Can be applied to individual route handlers or entire controller classes.
 * Essential for third-party webhooks (e.g., Stripe, PayPal), Server-Sent Events (SSE),
 * or raw file/XML download streams where envelope wrapping breaks external client contracts.
 *
 * @returns A NestJS custom metadata decorator.
 *
 * @example
 * ```typescript
 * @Controller('webhooks')
 * export class WebhookController {
 *   @Post('stripe')
 *   @BypassTransform()
 *   async handleStripeWebhook(@Req() req: Request): Promise<{ received: boolean }> {
 *     return { received: true };
 *   }
 * }
 * ```
 */
export const BypassTransform = () =>
    SetMetadata(BYPASS_TRANSFORM_KEY, true);