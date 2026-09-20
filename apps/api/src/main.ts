import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import {Logger, ValidationPipe} from "@nestjs/common";
import { AppModule } from "./app.module.js";
import cookieParser from "cookie-parser";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {SESSION_COOKIE_NAME} from "./modules/auth/auth.constants.js";
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
    const logger = new Logger("Bootstrap");
    const app = await NestFactory.create(AppModule);
    const port = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

    // ---------------------------------------------------------------------------
    // Perimeter Security Headers (Helmet)
    // ---------------------------------------------------------------------------
    app.use(
        helmet({
            // Swagger UI requires inline scripts/styles; loosen CSP in non-production
            contentSecurityPolicy:
                process.env.NODE_ENV === 'production'
                    ? {
                        directives: {
                            defaultSrc: ["'self'"],
                            scriptSrc: ["'self'"],
                            styleSrc: ["'self'", "'unsafe-inline'"],
                            imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
                        },
                    }
                    : false,
            crossOriginEmbedderPolicy: false,
        }),
    );

    // ---------------------------------------------------------------------------
    // Strict Parameterized CORS
    // ---------------------------------------------------------------------------
    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173'];

    app.enableCors({
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void,
        ) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-trace-id',
            'x-request-id',
            'x-correlation-id',
        ],
        exposedHeaders: ['x-trace-id'],
    });

    // ---------------------------------------------------------------------------
    // Middlewares & Global Pipes
    // ---------------------------------------------------------------------------
    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // ---------------------------------------------------------------------------
    // API Prefix & Documentation
    // ---------------------------------------------------------------------------
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

    app.enableShutdownHooks();

    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();