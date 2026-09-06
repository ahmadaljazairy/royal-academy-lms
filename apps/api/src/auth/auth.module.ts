import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SecurityModule } from '../security/security.module.js';
import {AuthController} from "./auth.controller.js";

@Module({
    imports: [SecurityModule],
    controllers: [AuthController],
    providers: [AuthService ],
    exports: [AuthService]
})
export class AuthModule {}