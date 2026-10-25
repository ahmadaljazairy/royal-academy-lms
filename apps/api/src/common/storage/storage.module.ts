/**
 * @file Global Storage Module
 * @module @royal-academy/api/common/storage/storage.module
 */

import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';

@Global()
@Module({
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule {}