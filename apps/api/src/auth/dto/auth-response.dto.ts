import { ApiProperty } from '@nestjs/swagger';
import { ResponseMetaDto } from '../../common/dto/api-response.dto.js';

export class UserProfileDto {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    id!: string;

    @ApiProperty({ example: 'academy.student@domain.com' })
    email!: string;

    @ApiProperty({ example: 'Ahmad Aljazairy' })
    displayName!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: string;

    @ApiProperty({ example: false })
    isEmailVerified!: boolean;
}

export class UserSessionDto {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    userId!: string;

    @ApiProperty({ example: 'academy.student@domain.com' })
    email!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: string;

    @ApiProperty({ example: 1788703200000, description: 'Unix timestamp in milliseconds' })
    createdAt!: number;
}

export class AuthResponseEnvelopeDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Account registered successfully' })
    message!: string;

    @ApiProperty({ type: UserProfileDto })
    data!: UserProfileDto;

    @ApiProperty({ type: ResponseMetaDto })
    meta!: ResponseMetaDto;
}

export class SessionResponseEnvelopeDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Authenticated profile retrieved' })
    message!: string;

    @ApiProperty({ type: UserSessionDto })
    data!: UserSessionDto;

    @ApiProperty({ type: ResponseMetaDto })
    meta!: ResponseMetaDto;
}