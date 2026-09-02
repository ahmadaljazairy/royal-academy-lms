import { Injectable } from "@nestjs/common";
import { prisma, type User } from "@template/database";
import type { HealthStatus } from "@template/types";

@Injectable()
export class AppService {
    getHealth(): HealthStatus {
        return {
            status: "ok",
            uptime: process.uptime(),
            version: "1.0.0",
        };
    }

    async getUsers(): Promise<User[]> {
        return prisma.user.findMany();
    }
}