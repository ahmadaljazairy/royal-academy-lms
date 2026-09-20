import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger, BadRequestException,
} from '@nestjs/common';

import type { AuthUserResponse, Role } from '@template/types';

import {type RegisterDto, type LoginDto, ResetPasswordDto} from './dto/index.js';
import {
    type SessionResult,
    SessionService,
    SESSION_TTL_HOURS,
} from '../../common/security/session.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { Argon2Service } from '../../common/security/argon2.service.js';
import {AuditLogService, SecurityAuditEvent} from "../../common/audit/audit-log.service.js";
import {AuthTokenManager, TokenType} from "./auth-token.manager.js";
import {EmailQueueService} from "../../common/email/email-queue.service.js";

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
        private readonly audit: AuditLogService,
        private readonly authTokenManager: AuthTokenManager,
        private readonly emailQueueService: EmailQueueService,
    ) {}


    async register(
        dto: RegisterDto,
        metadata?: RequestMetadata,
    ): Promise<AuthUserResponse> {
        // ---------------------------------------------------------
        // REGISTRATION FLOW
        // ---------------------------------------------------------
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
                isEmailVerified: false,
                // Atomically creates the linked Profile record
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

        // ---------------------------------------------------------
        // VERIFICATION FLOW
        // ---------------------------------------------------------
        // Generate 24h verification token in Redis
        const { rawToken, tokenHash } = await this.authTokenManager.generateToken(
            TokenType.EMAIL_VERIFICATION,
            user.id,
        );

        // Audit request using the SHA-256 hash
        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_VERIFY_EMAIL_REQUESTED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { tokenHash },
        });

        // Dispatch to BullMQ Redis queue
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


    async verifyEmail(token: string, metadata?: RequestMetadata): Promise<boolean> {
        if (!token) {
            throw new BadRequestException('Verification token is required.');
        }

        // Atomically fetch and delete token from Redis
        const userId = await this.authTokenManager.consumeToken(
            TokenType.EMAIL_VERIFICATION,
            token,
        );

        if (!userId) {
            throw new BadRequestException('Invalid or expired verification token.');
        }

        // Mark verified in PostgreSQL
        await this.prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        });

        await this.sessionService.updateUserSessions(userId, {
            isEmailVerified: true,
        });

        // Record completion audit
        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_VERIFY_EMAIL_COMPLETED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });

        this.logger.log(`Email verified successfully for userId: ${userId}`);
        return true;
    }

    async resendVerification(
        email: string,
        metadata?: RequestMetadata,
    ): Promise<void> {
        const normalizedEmail = email.toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, isEmailVerified: true },
        });

        // Anti-enumeration defense: return silently if user not found or already verified
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
                isEmailVerified : user.isEmailVerified
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

    /**
     * Request a password reset link.
     *
     * Anti-enumeration hardened: Returns generic success envelope whether
     * the email exists in PostgreSQL or not.
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

        // Anti-enumeration: Return silently without queuing email or revealing presence
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
            return;
        }

        // Generate 1-hour ephemeral token in Redis
        const { rawToken, tokenHash } = await this.authTokenManager.generateToken(
            TokenType.PASSWORD_RESET,
            user.id,
        );

        // Record audit event using SHA-256 hash (never raw token)
        await this.audit.record({
            userId: user.id,
            event: SecurityAuditEvent.AUTH_PASSWORD_RESET_REQUESTED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            metadata: { tokenHash },
        });

        // Enqueue job
        await this.emailQueueService.queuePasswordResetEmail(user.email, rawToken);

        this.logger.log(`Password reset email queued for userId: ${user.id}`);
    }

    /**
     * Execute password reset using a single-use ephemeral token.
     *
     * Consumes token from Redis via GETDEL, hashes the new password with Argon2id,
     * updates PostgreSQL, and terminates ALL active sessions across all devices.
     */
    async resetPassword(
        dto: ResetPasswordDto,
        metadata?: RequestMetadata,
    ): Promise<boolean> {
        if (!dto.token) {
            throw new BadRequestException('Reset token is required.');
        }

        // 1. Atomically consume token from Redis (GETDEL)
        const userId = await this.authTokenManager.consumeToken(
            TokenType.PASSWORD_RESET,
            dto.token,
        );

        if (!userId) {
            throw new BadRequestException('Invalid or expired password reset link.');
        }

        // 2. Hash new password using Argon2id
        const passwordHash = await this.argon2Service.hashPassword(dto.newPassword);

        // 3. Update database record
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        // 4. Invalidate all active Redis sessions across all browsers/devices
        await this.sessionService.destroyAllUserSessions(userId, metadata);

        // 5. Immutable audit record
        await this.audit.record({
            userId,
            event: SecurityAuditEvent.AUTH_PASSWORD_RESET_COMPLETED,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });

        this.logger.log(`Password reset completed successfully for userId: ${userId}`);
        return true;
    }
}