/**
 * @file Core Authentication Domain Service
 * @module @royal-academy/api/modules/auth/services/auth.service
 * @description Coordinates user registration, Argon2id credential verification,
 * stateful session management, ephemeral token workflows, and audit logging.
 */

import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import type { AuthUserResponse, Role } from '@royal-academy/types';

import {
    AuditLogService,
    SecurityAuditEvent,
} from '../../../common/audit/index.js';
import { EmailQueueService } from '../../../common/email/index.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Argon2Service } from '../../../common/security/argon2.service.js';

import { AuthTokenManager, TokenType } from './auth-token.manager.js';
import { type SessionResult, SessionService } from './session.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResetPasswordDto } from '../dto/password-reset.dto.js';

export interface LoginResult {
    readonly session: SessionResult;
    readonly user: AuthUserResponse;
}

export interface RequestMetadata {
    readonly ipAddress?: string;
    readonly userAgent?: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly argon2Service: Argon2Service,
        private readonly sessionService: SessionService,
        private readonly prisma: PrismaService,
        private readonly audit: AuditLogService,
        private readonly authTokenManager: AuthTokenManager,
        private readonly emailQueueService: EmailQueueService,
    ) {}

    /**
     * Retrieves the sanitized public profile for an authenticated user ID.
     */
    async getProfile(userId: string): Promise<AuthUserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
            },
        });

        if (!user) {
            throw new NotFoundException(
                `User with ID "${userId}" was not found.`,
            );
        }

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as Role,
            isEmailVerified: user.isEmailVerified,
        };
    }

    /**
     * Registers a new user account, hashes credentials with Argon2id,
     * creates linked records, and dispatches an email verification job.
     */
    async register(
        dto: RegisterDto,
        metadata?: RequestMetadata,
    ): Promise<AuthUserResponse> {
        const normalizedEmail = dto.email.trim().toLowerCase();

        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });

        if (existingUser) {
            throw new ConflictException(
                'A user with this email address already exists.',
            );
        }

        const passwordHash = await this.argon2Service.hashPassword(dto.password);
        const termsAcceptedAt = new Date();

        const user = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                displayName: dto.displayName,
                termsAcceptedAt,
                isEmailVerified: false,
                profile: {
                    create: {},
                },
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
            },
        });

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

        const { rawToken, tokenHash } = await this.authTokenManager.generateToken(
            TokenType.EMAIL_VERIFICATION,
            user.id,
        );

        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_VERIFY_EMAIL_REQUESTED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { tokenHash },
        });

        await this.emailQueueService.queueVerificationEmail(user.email, rawToken);

        this.logger.log(`User registered & verification queued: ${user.email}`);

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as Role,
            isEmailVerified: user.isEmailVerified,
        };
    }

    /**
     * Validates and consumes an email verification token, updates user status in PostgreSQL,
     * and patches active live sessions in Redis.
     */
    async verifyEmail(
        token: string,
        metadata?: RequestMetadata,
    ): Promise<boolean> {
        if (!token) {
            throw new BadRequestException('Verification token is required.');
        }

        const userId = await this.authTokenManager.consumeToken(
            TokenType.EMAIL_VERIFICATION,
            token,
        );

        if (!userId) {
            throw new BadRequestException(
                'Invalid or expired verification token.',
            );
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        });

        await this.sessionService.updateUserSessions(userId, {
            isEmailVerified: true,
        });

        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_VERIFY_EMAIL_COMPLETED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });

        this.logger.log(`Email verified successfully for userId: ${userId}`);
        return true;
    }

    /**
     * Resends an email verification link to unverified users.
     */
    async resendVerification(
        email: string,
        metadata?: RequestMetadata,
    ): Promise<void> {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, isEmailVerified: true },
        });

        if (!user || user.isEmailVerified) {
            return;
        }

        const { rawToken, tokenHash } = await this.authTokenManager.generateToken(
            TokenType.EMAIL_VERIFICATION,
            user.id,
        );

        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_VERIFY_EMAIL_REQUESTED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { tokenHash },
        });

        await this.emailQueueService.queueVerificationEmail(user.email, rawToken);

        this.logger.log(`Resent verification email for: ${user.email}`);
    }

    /**
     * Verifies user credentials against stored Argon2id hashes and initializes a stateful Redis session.
     */
    async login(dto: LoginDto): Promise<LoginResult> {
        const normalizedEmail = dto.email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
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

        const sessionResult = await this.sessionService.createSession({
            userId: user.id,
            email: user.email,
            role: user.role as Role,
            isEmailVerified: user.isEmailVerified,
            rememberMe: dto.rememberMe,
        });

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

    /**
     * Destroys an active login session in Redis.
     */
    async logout(sessionId: string): Promise<boolean> {
        if (!sessionId) {
            return false;
        }
        return this.sessionService.destroySession(sessionId);
    }

    /**
     * Generates a 1-hour password reset link and queues an email notification.
     */
    async forgotPassword(
        email: string,
        metadata?: RequestMetadata,
    ): Promise<void> {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true },
        });

        if (!user) {
            this.logger.warn(
                `Password reset requested for non-existent email: ${normalizedEmail}`,
            );
            return;
        }

        const { rawToken, tokenHash } = await this.authTokenManager.generateToken(
            TokenType.PASSWORD_RESET,
            user.id,
        );

        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_PASSWORD_RESET_REQUESTED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { tokenHash },
        });

        await this.emailQueueService.queuePasswordResetEmail(user.email, rawToken);

        this.logger.log(`Password reset email queued for userId: ${user.id}`);
    }

    /**
     * Executes a password reset using a single-use ephemeral token.
     */
    async resetPassword(
        dto: ResetPasswordDto,
        metadata?: RequestMetadata,
    ): Promise<boolean> {
        if (!dto.token) {
            throw new BadRequestException('Reset token is required.');
        }

        const userId = await this.authTokenManager.consumeToken(
            TokenType.PASSWORD_RESET,
            dto.token,
        );

        if (!userId) {
            throw new BadRequestException(
                'Invalid or expired password reset link.',
            );
        }

        const passwordHash = await this.argon2Service.hashPassword(
            dto.newPassword,
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        await this.sessionService.destroyAllUserSessions(userId, metadata);

        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_PASSWORD_RESET_COMPLETED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });

        this.logger.log(
            `Password reset completed successfully for userId: ${userId}`,
        );
        return true;
    }
}