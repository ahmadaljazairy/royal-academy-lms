import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
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