import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SecurityModule } from './security/security.module.js';
import { RedisModule } from './redis/redis.module.js';
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {TransformResponseInterceptor} from "./common/interceptors/transform-response.interceptor.js";
import {AllExceptionsFilter} from "./common/filters/all-exceptions.filter.js";

@Module({
    imports: [SecurityModule, RedisModule],
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
    ],
})
export class AppModule {}