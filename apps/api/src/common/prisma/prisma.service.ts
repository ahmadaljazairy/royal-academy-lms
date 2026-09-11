import {
    Injectable,
    type OnModuleInit,
    type OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { PrismaClient } from '@template/database';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('❌ FATAL: DATABASE_URL is not set in the environment.');
        }

        const adapter = new PrismaPg({ connectionString: databaseUrl });
        super({ adapter });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('Database connection successfully established via Prisma');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('Database connection pool cleanly drained and closed');
    }
}