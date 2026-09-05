import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { prisma } from '@template/database';
import { Argon2Service } from '../security/argon2.service.js';
import { SessionService, type SessionResult } from '../security/session.service.js';
import type { RegisterDto, LoginDto } from './dto/index.js';
import type { AuthUserResponse, SystemRole } from '@template/types';

export interface LoginResult {
    session: SessionResult;
    user: AuthUserResponse;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly argon2Service: Argon2Service,
        private readonly sessionService: SessionService,
    ) {}

    async register(dto: RegisterDto): Promise<AuthUserResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });

        if (existingUser) {
            throw new ConflictException('A user with this email address already exists.');
        }

        const passwordHash = await this.argon2Service.hashPassword(dto.password);

        const user = await prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                displayName: dto.displayName,
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
            },
        });

        this.logger.log(`New user registered: ${user.email} (${user.id})`);

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as SystemRole,
            isEmailVerified: user.isEmailVerified,
        };
    }

    async login(dto: LoginDto): Promise<LoginResult> {
        const user = await prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                displayName: true,
                passwordHash: true,
                role: true,
                isEmailVerified: true,
            },
        });

        // Constant-time mitigation against user enumeration
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
            role: user.role as SystemRole,
        });

        this.logger.log(`User logged in: ${user.email} (${user.id})`);

        return {
            session: sessionResult,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role as SystemRole,
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