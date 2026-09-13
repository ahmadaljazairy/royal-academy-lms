import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SecurityModule } from '../common/security/security.module.js';
import { AuthController } from './auth.controller.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { RateLimitGuard } from '../common/guards/rate-limit.guard.js';
import { AuthTokenManager } from './auth-token.manager.js';

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [AuthService, SessionAuthGuard, RateLimitGuard, AuthTokenManager],
    exports: [AuthService, SessionAuthGuard, RateLimitGuard, AuthTokenManager],
})
export class AuthModule {}