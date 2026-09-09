import { ApiProperty } from '@nestjs/swagger';
import type { ApiErrorResponse } from '@template/types';

export class ApiErrorResponseDto implements ApiErrorResponse {
    @ApiProperty({ example: false })
    success!: false;

    @ApiProperty({ example: 400 })
    statusCode!: number;

    @ApiProperty({ example: 'BadRequestException' })
    error!: string;

    @ApiProperty({
        description: 'High-level error description or an array of validation errors',
        oneOf: [
            { type: 'string', example: 'Validation failed' },
            { type: 'array', items: { type: 'string' }, example: ['email must be an email'] },
        ],
    })
    message!: string | string[];

    @ApiProperty({
        type: 'object',
        additionalProperties: false,
        nullable: true,
        default: null,
        example: null,
        description: 'Always null for error responses',
    })
    data!: null;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-08T18:00:00.000Z' })
    timestamp!: string;

}