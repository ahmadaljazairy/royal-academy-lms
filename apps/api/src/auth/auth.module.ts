import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SecurityModule } from '../security/security.module.js';
import {AuthController} from "./auth.controller.js";
import {SessionAuthGuard} from "./guards/session-auth.guard.js";

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [AuthService, SessionAuthGuard ],
    exports: [AuthService, SessionAuthGuard]
})
export class AuthModule {}