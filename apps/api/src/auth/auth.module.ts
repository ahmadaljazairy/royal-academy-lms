import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SecurityModule } from '../security/security.module.js';
import {AuthController} from "./auth.controller.js";
import {SessionAuthGuard} from "./guards/session-auth.guard.js";
import {RateLimitGuard} from "../common/guards/rate-limit.guard.js";

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [AuthService, SessionAuthGuard, RateLimitGuard ],
    exports: [AuthService, SessionAuthGuard, RateLimitGuard]
})
export class AuthModule {}