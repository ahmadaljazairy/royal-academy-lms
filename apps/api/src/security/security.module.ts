import { Module } from '@nestjs/common';
import { Argon2Service } from './argon2.service.js';
import { TokenService } from './token.service.js';
import { SessionService } from './session.service.js';

@Module({
    providers: [Argon2Service, TokenService, SessionService],
    exports: [Argon2Service, TokenService, SessionService],
})
export class SecurityModule {}