import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {TransformResponseInterceptor} from "./common/interceptors/transform-response.interceptor.js";
import {AllExceptionsFilter} from "./common/filters/all-exceptions.filter.js";
import {AuthModule} from "./auth/auth.module.js";
import {SessionAuthGuard} from "./auth/guards/session-auth.guard.js";
import {RolesGuard} from "./common/guards/roles.guard.js";
import {PrismaModule} from "./common/prisma/prisma.module.js";
import {AuditModule} from "./common/audit/audit.module.js";
import {RedisModule} from "./common/redis/redis.module.js";
import {SecurityModule} from "./common/security/security.module.js";
import {BullModule} from "@nestjs/bullmq";
import {EmailModule} from "./common/email/email.module.js";

@Module({
    imports: [
        SecurityModule,
        RedisModule,
        AuditModule,
        AuthModule,
        EmailModule,
        PrismaModule,
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: Number(process.env.REDIS_PORT || 6379),
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_GUARD,
            useClass: SessionAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}