import { ApiProperty } from '@nestjs/swagger';

export class ResponseMetaDto {
    @ApiProperty({ example: '2026-09-06T14:00:00.000Z' })
    timestamp!: string;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;
}

export class ErrorDetailDto {
    @ApiProperty({ example: 'email' })
    field!: string;

    @ApiProperty({ example: 'A valid email address is required.' })
    message!: string;
}

export class ErrorPayloadDto {
    @ApiProperty({ example: 400 })
    statusCode!: number;

    @ApiProperty({ example: 'Bad Request' })
    error!: string;

    @ApiProperty({
        example: 'Validation failed',
        description: 'High-level error description or an array of validation issues',
    })
    message!: string | string[];

    @ApiProperty({ example: '/api/auth/register' })
    path!: string;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-06T14:00:00.000Z' })
    timestamp!: string;
}

export class ApiErrorResponseDto {
    @ApiProperty({ example: false })
    success!: boolean;

    @ApiProperty({ type: ErrorPayloadDto })
    error!: ErrorPayloadDto;
}