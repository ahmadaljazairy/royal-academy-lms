import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';

import type { AuthUserResponse, Role } from '@template/types';

import type { RegisterDto, LoginDto } from './dto/index.js';
import {
    type SessionResult,
    SessionService,
    SESSION_TTL_HOURS,
} from '../common/security/session.service.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { Argon2Service } from '../common/security/argon2.service.js';
import {AuditLogService, SecurityAuditEvent} from "../common/audit/audit-log.service.js";

export interface LoginResult {
    session: SessionResult;
    user: AuthUserResponse;
}

export interface RequestMetadata {
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly argon2Service: Argon2Service,
        private readonly sessionService: SessionService,
        private readonly prisma: PrismaService,
        private readonly audit: AuditLogService
    ) {}


    async register(
        dto: RegisterDto,
        metadata?: RequestMetadata,
    ): Promise<AuthUserResponse> {
        const normalizedEmail = dto.email.toLowerCase();

        const existingUser = await this.prisma.user.findUnique({
            where: {email: normalizedEmail},
            select: {id: true},
        });

        if (existingUser) {
            throw new ConflictException('A user with this email address already exists.');
        }

        const passwordHash = await this.argon2Service.hashPassword(dto.password);
        const termsAcceptedAt = new Date();

        const user = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                displayName: dto.displayName,
                termsAcceptedAt,
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
            },
        });

        // Persist immutable audit entry
        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_REGISTER,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: {
                email: user.email,
                termsAcceptedAt: termsAcceptedAt.toISOString(),
            },
        });

        this.logger.log(`New user registered: ${user.email} (${user.id})`);

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as Role,
            isEmailVerified: user.isEmailVerified,
        };
    }


    async login(dto: LoginDto): Promise<LoginResult> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            select: {
                id: true,
                email: true,
                displayName: true,
                passwordHash: true,
                role: true,
                isEmailVerified: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const isPasswordValid = await this.argon2Service.verifyPassword(
            user.passwordHash,
            dto.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const ttlHours = dto.rememberMe
            ? SESSION_TTL_HOURS.REMEMBER_ME
            : SESSION_TTL_HOURS.STANDARD;

        const sessionResult = await this.sessionService.createSession(
            {
                userId: user.id,
                email: user.email,
                role: user.role as Role,
            },
            ttlHours,
        );

        this.logger.log(`User logged in: ${user.email} (${user.id})`);

        return {
            session: sessionResult,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role as Role,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
    async logout(sessionId: string): Promise<boolean> {
        if (!sessionId) {
            return false;
        }
        return this.sessionService.destroySession(sessionId);
    }
}