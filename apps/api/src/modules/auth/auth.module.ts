import { Module } from '@nestjs/common';

import { SecurityModule } from '../../common/security/security.module.js';
import { RateLimitGuard } from '../../common/guards/index.js';

import { AuthController } from './auth.controller.js';
import { AuthCacheRepository } from './cache/auth-cache.repository.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { AuthEventListener } from './listeners/auth-event.listener.js';
import { AuthService } from './services/auth.service.js';
import { AuthTokenManager } from './services/auth-token.manager.js';
import { SessionService } from './services/session.service.js';

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        SessionService,
        AuthTokenManager,
        AuthCacheRepository,
        SessionAuthGuard,
        RateLimitGuard,
        AuthEventListener,
    ],
    exports: [
        AuthService,
        SessionService,
        AuthTokenManager,
        AuthCacheRepository,
        SessionAuthGuard,
        RateLimitGuard,
    ],
})
export class AuthModule {}