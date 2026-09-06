import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SecurityModule } from './security/security.module.js';
import { RedisModule } from './redis/redis.module.js';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {TransformResponseInterceptor} from "./common/interceptors/transform-response.interceptor.js";
import {AllExceptionsFilter} from "./common/filters/all-exceptions.filter.js";
import {AuthModule} from "./auth/auth.module.js";
import {SessionAuthGuard} from "./auth/guards/session-auth.guard.js";
import {RolesGuard} from "./common/guards/roles.guard.js";

@Module({
    imports: [SecurityModule, RedisModule, AuthModule],
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