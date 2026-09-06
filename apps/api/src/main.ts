import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import {Logger, ValidationPipe} from "@nestjs/common";
import { AppModule } from "./app.module.js";
import cookieParser from "cookie-parser";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {SESSION_COOKIE_NAME} from "./auth/auth.constants.js";

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

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Royal Academy LMS API')
        .setDescription(
            'Secure-by-default REST API with stateful Redis session authentication and RBAC.',
        )
        .setVersion('1.0.0')
        // Cookie authentication scheme in OpenAPI specification
        .addCookieAuth(
            SESSION_COOKIE_NAME,
            {
                type: 'apiKey',
                in: 'cookie',
                name: SESSION_COOKIE_NAME,
                description: 'Stateful Redis session cookie issued upon login',
            },
            'session-cookie',
        )
        .addTag('Auth', 'Authentication and session lifecycle operations')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Royal Academy API Docs',
    });

    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();