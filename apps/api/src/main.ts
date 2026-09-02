import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
    const logger = new Logger("Bootstrap");
    const app = await NestFactory.create(AppModule);
    const port = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

    app.enableCors();

    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();