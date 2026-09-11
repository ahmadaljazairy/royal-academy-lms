import { ApiProperty } from '@nestjs/swagger';
import type {
    UserProfile,
    UserSession,
    LogoutResult,
    ApiSuccessResponse,
    Role,
} from '@template/types';

export class UserProfileDto implements UserProfile {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    id!: string;

    @ApiProperty({ example: 'academy.student@domain.com' })
    email!: string;

    @ApiProperty({ example: 'Ahmad Aljazairy' })
    displayName!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: Role;

    @ApiProperty({ example: false })
    isEmailVerified!: boolean;
}

export class UserSessionDto implements UserSession {
    @ApiProperty({ example: 'usr_cm1349f82000008l07b60g5d7' })
    userId!: string;

    @ApiProperty({ example: 'academy.student@domain.com' })
    email!: string;

    @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] })
    role!: Role;

    @ApiProperty({ example: 1788703200000, description: 'Unix timestamp in milliseconds' })
    createdAt!: number;
}

export class LogoutDataDto implements LogoutResult {
    @ApiProperty({ example: true })
    loggedOut!: boolean;
}

export class AuthResponseEnvelopeDto implements ApiSuccessResponse<UserProfileDto> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Operation completed successfully' })
    message!: string;

    @ApiProperty({ type: UserProfileDto })
    data!: UserProfileDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-08T18:00:00.000Z' })
    timestamp!: string;
}

export class SessionResponseEnvelopeDto implements ApiSuccessResponse<UserSessionDto> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Authenticated profile retrieved' })
    message!: string;

    @ApiProperty({ type: UserSessionDto })
    data!: UserSessionDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-08T18:00:00.000Z' })
    timestamp!: string;
}

export class LogoutResponseEnvelopeDto implements ApiSuccessResponse<LogoutDataDto> {
    @ApiProperty({ example: true })
    success!: true;

    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({ example: 'Logged out successfully' })
    message!: string;

    @ApiProperty({ type: LogoutDataDto })
    data!: LogoutDataDto;

    @ApiProperty({ example: 'd2997aca-cdd4-4172-9696-ae5bece225c0' })
    traceId!: string;

    @ApiProperty({ example: '2026-09-08T18:00:00.000Z' })
    timestamp!: string;

}