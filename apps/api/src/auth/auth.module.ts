import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SecurityModule } from '../security/security.module.js';

@Module({
    imports: [SecurityModule],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}