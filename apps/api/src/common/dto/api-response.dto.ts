/**
 * @file OpenAPI Response Envelopes
 * @module @template/api/common/dto/api-response
 * @description Concrete Swagger DTO classes implementing shared monorepo contracts.
 * Used by `@ApiDoc()` to compose dynamic success schemas and document standardized error responses.
 */

import { ApiProperty } from '@nestjs/swagger';
import type { ApiSuccessResponse, ApiErrorResponse } from '@template/types';

/**
 * Base success envelope matching `TransformResponseInterceptor`.
 * The concrete type and schema of `data` is composed dynamically via `@ApiDoc()` using `allOf`.
 */
export class BaseSuccessEnvelopeDto<T = unknown>
    implements ApiSuccessResponse<T>
{
    @ApiProperty({
        example: true,
        description: 'Discriminator confirming request success',
    })
    success: true = true as const;

    @ApiProperty({
        description: 'HTTP response status code',
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Human-readable status description or confirmation message',
    })
    message!: string;

    /**
     * The primary serialized domain entity or payload.
     * Dynamically populated via OpenAPI schema composition (`allOf`) inside `@ApiDoc()`.
     */
    data!: T;

    @ApiProperty({
        example: 'd2997aca-cdd4-4172-9696-ae5bece225c0',
        description: 'Distributed correlation or trace ID for end-to-end request tracking',
    })
    traceId!: string;

    @ApiProperty({
        example: '2026-10-02T11:43:00.000Z',
        description: 'ISO 8601 formatted timestamp of when the response was serialized',
    })
    timestamp!: string;

}

/**
 * Universal error envelope matching `AllExceptionsFilter`.
 */
export class ApiErrorResponseDto implements ApiErrorResponse {
    @ApiProperty({
        example: false,
        description: 'Discriminator confirming request failure',
    })
    success: false = false as const;

    @ApiProperty({
        description: 'HTTP error status code',
    })
    statusCode!: number;

    @ApiProperty({
        description: 'High-level HTTP error title or class category',
    })
    error!: string;

    @ApiProperty({
        description: 'High-level error description or an array of class-validator messages',
        oneOf: [
            { type: 'string'},
            {
                type: 'array',
                items: { type: 'string' },
            },
        ],
    })
    message!: string | string[];

    @ApiProperty({
        type: 'object',
        additionalProperties: false,
        nullable: true,
        default: null,
        example: null,
        description: 'Always null for error responses to maintain JSON structural symmetry',
    })
    data: null = null;

    @ApiProperty({
        example: 'd2997aca-cdd4-4172-9696-ae5bece225c0',
        description: 'Correlation trace ID matching server audit logs for incident reporting',
    })
    traceId!: string;

    @ApiProperty({
        example: '2026-10-02T11:43:00.000Z',
        description: 'ISO 8601 formatted timestamp of when the error occurred',
    })
    timestamp!: string;
}