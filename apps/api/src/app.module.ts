import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SecurityModule } from './security/security.module.js';
import { RedisModule } from './redis/redis.module.js';

@Module({
    imports: [SecurityModule, RedisModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}