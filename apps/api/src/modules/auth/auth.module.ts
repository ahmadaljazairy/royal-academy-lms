import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service.js';
import { SecurityModule } from '../../common/security/security.module.js';
import { AuthController } from './auth.controller.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import {RateLimitGuard} from "../../common/guards/index.js";
import { AuthTokenManager } from './auth-token.manager.js';
import {AuthCacheRepository} from "./cache/auth-cache.repository.js";

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [AuthService, SessionAuthGuard, RateLimitGuard, AuthTokenManager, AuthCacheRepository],
    exports: [AuthService, SessionAuthGuard, RateLimitGuard, AuthTokenManager,AuthCacheRepository ],
})
export class AuthModule {}