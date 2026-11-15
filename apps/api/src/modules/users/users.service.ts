import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
    UserProfileResponse,
    PublicProfileResponse,
    PresignedPostUploadResponse,
    ConfirmAvatarUploadResponse,
    ChangePasswordResponse,
    Role,
} from '@royal-academy/types';

import { PrismaService } from '../../common/prisma/prisma.service.js';
import { StorageService } from '../../common/storage/index.js';
import { Argon2Service } from '../../common/security/argon2.service.js';
import { UserPasswordChangedEvent } from '../auth/listeners/auth-event.listener.js';

import type {
    UpdateProfileDto,
    RequestAvatarUploadDto,
    ConfirmAvatarUploadDto,
    ChangePasswordDto,
} from './dto/index.js';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly argon2Service: Argon2Service,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async getMeProfile(userId: string): Promise<UserProfileResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                profile: {
                    select: {
                        headline: true,
                        bio: true,
                        avatarUrl: true,
                        phoneNumber: true,
                        websiteUrl: true,
                        githubUrl: true,
                        linkedinUrl: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!user || !user.profile) {
            throw new NotFoundException('User profile not found.');
        }

        return {
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as Role,
            isEmailVerified: user.isEmailVerified,
            headline: user.profile.headline,
            bio: user.profile.bio,
            avatarUrl: user.profile.avatarUrl,
            phoneNumber: user.profile.phoneNumber,
            websiteUrl: user.profile.websiteUrl,
            githubUrl: user.profile.githubUrl,
            linkedinUrl: user.profile.linkedinUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.profile.updatedAt.toISOString(),
        };
    }

    async updateMeProfile(
        userId: string,
        dto: UpdateProfileDto,
    ): Promise<UserProfileResponse> {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });

        if (!existingUser) {
            throw new NotFoundException('User account not found.');
        }

        const shouldUpdateDisplayName =
            dto.displayName !== undefined &&
            dto.displayName !== existingUser.displayName;

        const { displayName, updatedProfile } = await this.prisma.$transaction(
            async (tx) => {
                const resolvedDisplayName = shouldUpdateDisplayName
                    ? (
                        await tx.user.update({
                            where: { id: userId },
                            data: { displayName: dto.displayName },
                            select: { displayName: true },
                        })
                    ).displayName
                    : existingUser.displayName;

                const profile = await tx.profile.upsert({
                    where: { userId },
                    create: {
                        userId,
                        headline: dto.headline,
                        bio: dto.bio,
                        phoneNumber: dto.phoneNumber,
                        websiteUrl: dto.websiteUrl,
                        githubUrl: dto.githubUrl,
                        linkedinUrl: dto.linkedinUrl,
                    },
                    update: {
                        ...(dto.headline !== undefined && {
                            headline: dto.headline,
                        }),
                        ...(dto.bio !== undefined && { bio: dto.bio }),
                        ...(dto.phoneNumber !== undefined && {
                            phoneNumber: dto.phoneNumber,
                        }),
                        ...(dto.websiteUrl !== undefined && {
                            websiteUrl: dto.websiteUrl,
                        }),
                        ...(dto.githubUrl !== undefined && {
                            githubUrl: dto.githubUrl,
                        }),
                        ...(dto.linkedinUrl !== undefined && {
                            linkedinUrl: dto.linkedinUrl,
                        }),
                    },
                    select: {
                        headline: true,
                        bio: true,
                        avatarUrl: true,
                        phoneNumber: true,
                        websiteUrl: true,
                        githubUrl: true,
                        linkedinUrl: true,
                        updatedAt: true,
                    },
                });

                return {
                    displayName: resolvedDisplayName,
                    updatedProfile: profile,
                };
            },
        );

        return {
            userId: existingUser.id,
            email: existingUser.email,
            displayName,
            role: existingUser.role as Role,
            isEmailVerified: existingUser.isEmailVerified,
            headline: updatedProfile.headline,
            bio: updatedProfile.bio,
            avatarUrl: updatedProfile.avatarUrl,
            phoneNumber: updatedProfile.phoneNumber,
            websiteUrl: updatedProfile.websiteUrl,
            githubUrl: updatedProfile.githubUrl,
            linkedinUrl: updatedProfile.linkedinUrl,
            createdAt: existingUser.createdAt.toISOString(),
            updatedAt: updatedProfile.updatedAt.toISOString(),
        };
    }

    async requestAvatarUploadTicket(
        userId: string,
        dto: RequestAvatarUploadDto,
    ): Promise<PresignedPostUploadResponse> {
        return this.storageService.generatePresignedPost({
            scope: 'AVATAR',
            userId,
            mimeType: dto.mimeType,
            originalFilename: dto.originalFilename,
        });
    }

    async confirmAvatarUpload(
        userId: string,
        dto: ConfirmAvatarUploadDto,
    ): Promise<ConfirmAvatarUploadResponse> {
        const {
            spec: { pathPrefix },
        } = this.storageService.getScopeSpec('AVATAR');
        const expectedPrefix = `${pathPrefix}/${userId}-`;

        if (!dto.fileKey.startsWith(expectedPrefix)) {
            throw new ForbiddenException(
                'Access denied: You cannot attach an asset you do not own.',
            );
        }

        const verifiedObject = await this.storageService.verifyAndInspectObject(
            dto.fileKey,
            'AVATAR',
        );

        const currentProfile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { avatarUrl: true },
        });

        await this.prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                avatarUrl: verifiedObject.publicUrl,
            },
            update: {
                avatarUrl: verifiedObject.publicUrl,
            },
        });

        if (
            currentProfile?.avatarUrl &&
            currentProfile.avatarUrl !== verifiedObject.publicUrl
        ) {
            const oldKey = this.extractKeyFromUrl(
                currentProfile.avatarUrl,
                pathPrefix,
            );
            if (oldKey) {
                await this.storageService.deleteObject(oldKey, 'AVATAR');
            }
        }

        return { avatarUrl: verifiedObject.publicUrl };
    }

    async changePassword(
        userId: string,
        currentSessionId: string,
        dto: ChangePasswordDto,
        metadata?: { ipAddress?: string; userAgent?: string },
    ): Promise<ChangePasswordResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                passwordHash: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User account not found.');
        }

        const isCurrentValid = await this.argon2Service.verifyPassword(
            user.passwordHash,
            dto.currentPassword,
        );
        if (!isCurrentValid) {
            throw new UnauthorizedException('Current password does not match.');
        }

        const isSamePassword = await this.argon2Service.verifyPassword(
            user.passwordHash,
            dto.newPassword,
        );
        if (isSamePassword) {
            throw new BadRequestException(
                'New password must be different from current password.',
            );
        }

        const newHash = await this.argon2Service.hashPassword(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });

        this.eventEmitter.emit(
            'user.password-changed',
            new UserPasswordChangedEvent(userId, currentSessionId, metadata),
        );

        this.logger.log(`Password changed for userId: ${userId}`);

        return {
            message: 'Password successfully changed. Other sessions revoked.',
        };
    }

    async getPublicProfile(userId: string): Promise<PublicProfileResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                displayName: true,
                role: true,
                profile: {
                    select: {
                        headline: true,
                        bio: true,
                        avatarUrl: true,
                        websiteUrl: true,
                        githubUrl: true,
                        linkedinUrl: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Public profile not found.');
        }

        return {
            userId: user.id,
            displayName: user.displayName,
            role: user.role as Role,
            headline: user.profile?.headline ?? null,
            bio: user.profile?.bio ?? null,
            avatarUrl: user.profile?.avatarUrl ?? null,
            websiteUrl: user.profile?.websiteUrl ?? null,
            githubUrl: user.profile?.githubUrl ?? null,
            linkedinUrl: user.profile?.linkedinUrl ?? null,
        };
    }

    private extractKeyFromUrl(url: string, pathPrefix: string): string | null {
        try {
            const parsed = new URL(url);
            const parts = parsed.pathname.split('/');
            const prefixIndex = parts.indexOf(pathPrefix);
            if (prefixIndex !== -1) {
                return parts.slice(prefixIndex).join('/');
            }
            return null;
        } catch {
            return null;
        }
    }
}