import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { StorageService } from '../../common/storage/index.js';
import type {
    UserProfileResponse,
    PublicProfileResponse,
    PresignedPostUploadResponse,
} from '@template/types';
import type {
    UpdateProfileDto,
    RequestAvatarUploadDto,
    ConfirmAvatarUploadDto,
    ChangePasswordDto,
} from './dto/index.js';
import {SessionService} from "../../common/security/session.service.js";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly sessionService: SessionService,
    ) {}

    async getMeProfile(userId: string): Promise<UserProfileResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user || !user.profile) {
            throw new NotFoundException('User profile not found.');
        }

        return {
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException('User account not found.');
        }

        // 1. If displayName is modified, update database
        if (dto.displayName && dto.displayName !== user.displayName) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { displayName: dto.displayName },
            });
        }

        // 2. Upsert profile metadata
        const updatedProfile = await this.prisma.profile.upsert({
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
                ...(dto.headline !== undefined && { headline: dto.headline }),
                ...(dto.bio !== undefined && { bio: dto.bio }),
                ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
                ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
                ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
                ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
            },
        });

        return {
            userId: user.id,
            email: user.email,
            displayName: dto.displayName ?? user.displayName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            headline: updatedProfile.headline,
            bio: updatedProfile.bio,
            avatarUrl: updatedProfile.avatarUrl,
            phoneNumber: updatedProfile.phoneNumber,
            websiteUrl: updatedProfile.websiteUrl,
            githubUrl: updatedProfile.githubUrl,
            linkedinUrl: updatedProfile.linkedinUrl,
            createdAt: user.createdAt.toISOString(),
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
    ): Promise<{ avatarUrl: string }> {
        const expectedPrefix = `avatars/${userId}-`;
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

        if (currentProfile?.avatarUrl && currentProfile.avatarUrl !== verifiedObject.publicUrl) {
            const oldKey = this.extractKeyFromUrl(currentProfile.avatarUrl);
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
    ): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User account not found.');
        }

        const isCurrentValid = await argon2.verify(
            user.passwordHash,
            dto.currentPassword,
        );
        if (!isCurrentValid) {
            throw new UnauthorizedException('Current password does not match.');
        }

        const isSamePassword = await argon2.verify(
            user.passwordHash,
            dto.newPassword,
        );
        if (isSamePassword) {
            throw new BadRequestException(
                'New password must be different from current password.',
            );
        }

        const newHash = await argon2.hash(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });

        // Uses SessionService to revoke other sessions and append to the audit trail
        await this.sessionService.destroyOtherUserSessions(
            userId,
            currentSessionId,
            metadata,
        );

        return {
            message: 'Password successfully changed. Other sessions revoked.',
        };
    }

    async getPublicProfile(userId: string): Promise<PublicProfileResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException('Public profile not found.');
        }

        return {
            userId: user.id,
            displayName: user.displayName,
            role: user.role,
            headline: user.profile?.headline ?? null,
            bio: user.profile?.bio ?? null,
            avatarUrl: user.profile?.avatarUrl ?? null,
            websiteUrl: user.profile?.websiteUrl ?? null,
            githubUrl: user.profile?.githubUrl ?? null,
            linkedinUrl: user.profile?.linkedinUrl ?? null,
        };
    }

    private extractKeyFromUrl(url: string): string | null {
        try {
            const parsed = new URL(url);
            const parts = parsed.pathname.split('/');
            const avatarsIndex = parts.indexOf('avatars');
            if (avatarsIndex !== -1) {
                return parts.slice(avatarsIndex).join('/');
            }
            return null;
        } catch {
            return null;
        }
    }
}