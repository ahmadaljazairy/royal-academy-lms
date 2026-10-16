/**
 * @file Global Email Module
 * @module @royal-academy/api/common/email/email.module
 */

import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { EMAIL_QUEUE } from './email.constants.js';
import { EmailQueueService } from './email-queue.service.js';
import { EmailProcessor } from './email.processor.js';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: EMAIL_QUEUE,
        }),
    ],
    providers: [EmailQueueService, EmailProcessor],
    exports: [EmailQueueService],
})
export class EmailModule {}