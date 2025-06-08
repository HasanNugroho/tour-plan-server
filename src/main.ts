import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './config/logger.config';
import { AuthGuard } from './account/application/guards/auth.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger(winstonLoggerConfig),
    });
    const configService = app.get(ConfigService);

    // Apply global pipes, filters, and CORS
    configureApp(app);

    // Retrieve app configuration values
    const { name, desc, version, port } = getAppConfig(configService);

    // Set up Swagger
    setupSwagger(app, { name, desc, version });

    // Start the application
    await app.listen(port ?? 3000);
}

/**
 * Configure global app settings like validation pipes, CORS, and exception filters
 * @param app The NestJS application instance
 */
function configureApp(app) {
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    app.enableCors();
}

/**
 * Retrieve application configuration from ConfigService
 * @param configService The ConfigService instance
 * @returns An object containing app configuration values
 */
function getAppConfig(configService: ConfigService) {
    return {
        name: configService.get('name'),
        desc: configService.get('desc'),
        version: configService.get('version'),
        port: configService.get('PORT'),
    };
}

/**
 * Set up Swagger API documentation
 * @param app The NestJS application instance
 * @param config An object containing the app's name, description, and version
 */
function setupSwagger(app, config: { name: string, desc: string, version: string }) {
    const swaggerConfig = new DocumentBuilder()
        .setTitle(config.name)
        .setDescription(config.desc)
        .setVersion(config.version)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
}

bootstrap();
