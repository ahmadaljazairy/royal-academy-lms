import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import {Logger, ValidationPipe} from "@nestjs/common";
import { AppModule } from "./app.module.js";
import cookieParser from "cookie-parser";

async function bootstrap(): Promise<void> {
    const logger = new Logger("Bootstrap");
    const app = await NestFactory.create(AppModule);
    const port = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

    app.enableCors();
    app.enableShutdownHooks();

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix('api');

    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();