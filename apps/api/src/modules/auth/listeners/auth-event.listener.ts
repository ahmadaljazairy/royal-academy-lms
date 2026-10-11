/**
 * @file Auth Event Listener
 * @module @royal-academy/api/modules/auth/listeners/auth-event.listener
 * @description Decouples cross-module security reactions (such as session revocation
 * upon password change) using NestJS EventEmitter2.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionService } from '../services/session.service.js';

export class UserPasswordChangedEvent {
    constructor(
        public readonly userId: string,
        public readonly activeSessionId: string,
        public readonly metadata?: { ipAddress?: string; userAgent?: string },
    ) {}
}

@Injectable()
export class AuthEventListener {
    private readonly logger = new Logger(AuthEventListener.name);

    constructor(private readonly sessionService: SessionService) {}

    /**
     * Asynchronously revokes all active sessions for a user EXCEPT the session
     * on which the password change occurred.
     */
    @OnEvent('user.password-changed', { async: true })
    async handleUserPasswordChanged(
        event: UserPasswordChangedEvent,
    ): Promise<void> {
        try {
            await this.sessionService.destroyOtherUserSessions(
                event.userId,
                event.activeSessionId,
                event.metadata,
            );
        } catch (error) {
            this.logger.error(
                `Failed to revoke sessions following password change for user: ${event.userId}`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}