import { Controller, Get } from "@nestjs/common";
import type { ApiResponse, HealthStatus } from "@template/types";
import type { User } from "@template/database";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("health")
    getHealth(): ApiResponse<HealthStatus> {
        return {
            success: true,
            data: this.appService.getHealth(),
            timestamp: new Date().toISOString(),
        };
    }

    @Get("users")
    async getUsers(): Promise<ApiResponse<User[]>> {
        const users = await this.appService.getUsers();
        return {
            success: true,
            data: users,
            timestamp: new Date().toISOString(),
        };
    }
}