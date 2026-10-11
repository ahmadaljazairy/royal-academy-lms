import { Module } from '@nestjs/common';
import { Argon2Service } from './argon2.service.js';
import { TokenService } from './token.service.js';

@Module({
    providers: [Argon2Service, TokenService],
    exports: [Argon2Service, TokenService],
})
export class SecurityModule {}