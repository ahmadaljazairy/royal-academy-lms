import { Module } from '@nestjs/common';

import { SecurityModule } from '../../common/security/security.module.js';
import { RateLimitGuard } from '../../common/guards/index.js';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
    imports: [SecurityModule],
    controllers: [UsersController],
    providers: [UsersService, RateLimitGuard],
    exports: [UsersService],
})
export class UsersModule {}