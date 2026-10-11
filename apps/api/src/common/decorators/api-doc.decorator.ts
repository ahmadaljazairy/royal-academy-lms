/**
 * @file OpenAPI Schema Composition & Documentation Decorator
 * @module @royal-academy/api/common/decorators/api-doc
 * @description Composite decorator unifying Swagger documentation, OpenAPI `allOf` schema composition,
 * HTTP wire status code assignment (`@HttpCode`), and runtime response message injection (`@ResponseMessage`).
 */

import {
    applyDecorators,
    type Type,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiExtraModels,
    getSchemaPath,
    type SchemaObject,
    type ReferenceObject,
} from '@nestjs/swagger';

import { ResponseMessage } from './response.decorators.js';
import {
    BaseSuccessEnvelopeDto,
    ApiErrorResponseDto,
} from '../dto/api-response.dto.js';

/**
 * Standard HTTP error status codes supported for automatic Swagger documentation.
 */
export type SupportedErrorCode =
    | HttpStatus.BAD_REQUEST // 400
    | HttpStatus.UNAUTHORIZED // 401
    | HttpStatus.FORBIDDEN // 403
    | HttpStatus.NOT_FOUND // 404
    | HttpStatus.CONFLICT // 409
    | HttpStatus.UNPROCESSABLE_ENTITY // 422
    | HttpStatus.TOO_MANY_REQUESTS // 429
    | HttpStatus.INTERNAL_SERVER_ERROR // 500
    | HttpStatus.SERVICE_UNAVAILABLE; // 503

/**
 * NestJS exception class names mapped to standard HTTP error status codes.
 */
const ERROR_NAMES: Record<SupportedErrorCode, string> = {
    [HttpStatus.BAD_REQUEST]: 'BadRequestException',
    [HttpStatus.UNAUTHORIZED]: 'UnauthorizedException',
    [HttpStatus.FORBIDDEN]: 'ForbiddenException',
    [HttpStatus.NOT_FOUND]: 'NotFoundException',
    [HttpStatus.CONFLICT]: 'ConflictException',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'UnprocessableEntityException',
    [HttpStatus.TOO_MANY_REQUESTS]: 'TooManyRequestsException',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerErrorException',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'ServiceUnavailableException',
};

/**
 * Default error descriptions mapped to standard HTTP error status codes.
 */
const DEFAULT_ERROR_DESCRIPTIONS: Record<SupportedErrorCode, string> = {
    [HttpStatus.BAD_REQUEST]:
        'Bad Request: Validation failed or malformed request payload.',
    [HttpStatus.UNAUTHORIZED]:
        'Unauthorized: Session token is missing, invalid, or expired.',
    [HttpStatus.FORBIDDEN]:
        'Forbidden: Insufficient privileges or domain permission mismatch.',
    [HttpStatus.NOT_FOUND]:
        'Not Found: The requested domain resource does not exist.',
    [HttpStatus.CONFLICT]:
        'Conflict: State collision occurred (e.g., unique key violation).',
    [HttpStatus.UNPROCESSABLE_ENTITY]:
        'Unprocessable Entity: Payload syntax is valid, but domain business rules failed.',
    [HttpStatus.TOO_MANY_REQUESTS]:
        'Too Many Requests: Rate limit exceeded. Back off and retry later.',
    [HttpStatus.INTERNAL_SERVER_ERROR]:
        'Internal Server Error: An unhandled server error occurred.',
    [HttpStatus.SERVICE_UNAVAILABLE]:
        'Service Unavailable: Upstream dependency or database connection offline.',
};

/**
 * Configuration options for the `@ApiDoc()` composite decorator.
 *
 * @royal-academy TModel - The inner DTO class represented within `data`.
 */
export interface ApiDocOptions<TModel extends Type<unknown>> {
    /** Brief operation summary displayed in Swagger UI */
    summary: string;

    /** Detailed explanation of business logic, requirements, or side effects */
    description?: string;

    /** Custom message injected into the wire envelope via `@ResponseMessage()` */
    message?: string;

    /** HTTP success status code override (defaults to 200 OK) */
    status?: HttpStatus;

    /** The target DTO class enclosed within `data` (accepts `UserDto` or `[UserDto]`) */
    type?: TModel | [TModel];

    /** Explicit boolean flag indicating if `data` is an array of `type` */
    isArray?: boolean;

    /**
     * Indicates if the route returns a paginated collection (`ApiPaginatedResponse`).
     * When `true`, automatically formats `data` as an array and injects pagination `meta` schema.
     */
    isPaginated?: boolean;

    /** Array of HTTP error status codes to document for this route */
    errors?: SupportedErrorCode[];
}

/**
 * Composite decorator unifying endpoint documentation and response contract synchronization.
 *
 * @example
 * ```typescript
 * // Standard single entity response
 * @Get(':id')
 * @ApiDoc({
 *   summary: 'Find user profile by ID',
 *   type: UserResponseDto,
 *   errors: [HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
 * })
 *
 * // Paginated collection response
 * @Get()
 * @ApiDoc({
 *   summary: 'List paginated courses',
 *   type: CourseOverviewDto,
 *   isPaginated: true,
 *   errors: [HttpStatus.UNAUTHORIZED, HttpStatus.BAD_REQUEST],
 * })
 * ```
 */
export function ApiDoc<TModel extends Type<unknown>>(
    options: ApiDocOptions<TModel>,
): MethodDecorator {
    const status = options.status ?? HttpStatus.OK;
    const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> =
        [];

    // -------------------------------------------------------------------------
    // 1. Synchronize HTTP Wire Status & Custom Response Message
    // -------------------------------------------------------------------------
    decorators.push(HttpCode(status));

    if (options.message) {
        decorators.push(ResponseMessage(options.message));
    }

    // -------------------------------------------------------------------------
    // 2. Attach Swagger Operation Metadata
    // -------------------------------------------------------------------------
    decorators.push(
        ApiOperation({
            summary: options.summary,
            description: options.description,
        }),
    );

    // -------------------------------------------------------------------------
    // 3. Dynamic Success Envelope Composition (OpenAPI allOf)
    // -------------------------------------------------------------------------
    const isArray =
        options.isArray ||
        options.isPaginated ||
        Array.isArray(options.type);

    const rawModel = Array.isArray(options.type)
        ? options.type[0]
        : options.type;

    const successMessage = options.message ?? 'Operation completed successfully.';

    if (rawModel) {
        // Explicitly typed as SchemaObject | ReferenceObject
        const dataSchema: SchemaObject | ReferenceObject = isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(rawModel) },
            }
            : {
                $ref: getSchemaPath(rawModel),
            };

        // Explicitly typed as Record<string, SchemaObject | ReferenceObject>
        const responseProperties: Record<string, SchemaObject | ReferenceObject> = {
            statusCode: { type: 'integer', example: status },
            message: { type: 'string', example: successMessage },
            data: dataSchema,
        };

        // Inject structured pagination metadata schema ONLY if isPaginated is explicitly true
        if (options.isPaginated) {
            responseProperties.meta = {
                type: 'object',
                description: 'Pagination metadata context',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    totalItems: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 10 },
                    hasNextPage: { type: 'boolean', example: true },
                    hasPreviousPage: { type: 'boolean', example: false },
                },
            };
        }

        decorators.push(
            ApiExtraModels(BaseSuccessEnvelopeDto, rawModel),
            ApiResponse({
                status,
                description: successMessage,
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(BaseSuccessEnvelopeDto) },
                        { properties: responseProperties },
                    ],
                },
            }),
        );
    }

    // -------------------------------------------------------------------------
    // 4. Uniform Error Responses Documentation
    // -------------------------------------------------------------------------
    if (options.errors?.length) {
        decorators.push(ApiExtraModels(ApiErrorResponseDto));

        for (const errorCode of options.errors) {
            const errorName = ERROR_NAMES[errorCode] ?? 'HttpException';
            const errorDescription =
                DEFAULT_ERROR_DESCRIPTIONS[errorCode] ?? 'Error response envelope.';

            decorators.push(
                ApiResponse({
                    status: errorCode,
                    description: errorDescription,
                    schema: {
                        allOf: [
                            { $ref: getSchemaPath(ApiErrorResponseDto) },
                            {
                                properties: {
                                    statusCode: { type: 'integer', example: errorCode },
                                    error: { type: 'string', example: errorName },
                                    message: {
                                        oneOf: [
                                            { type: 'string' },
                                            { type: 'array', items: { type: 'string' } },
                                        ],
                                        example: errorDescription,
                                    },
                                },
                            },
                        ],
                    },
                }),
            );
        }
    }

    return applyDecorators(...decorators);
}