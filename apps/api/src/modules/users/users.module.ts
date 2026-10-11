import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

import {PrismaModule} from "../../common/prisma/prisma.module.js";
import {StorageModule} from "../../common/storage/index.js";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}