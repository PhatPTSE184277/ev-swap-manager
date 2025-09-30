import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');
    app.setGlobalPrefix('api/v1');

    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:8081',
        ],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                const errors = validationErrors.map((error) => {
                    const firstMsg = error.constraints
                        ? Object.values(error.constraints)[0]
                        : 'Validation error';
                    return { [error.property]: firstMsg };
                });
                return new BadRequestException(errors);
            }
        })
    );

    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionFilter());

    //Swagger setup
    const config = new DocumentBuilder()
        .setTitle('FastFood API')
        .setDescription('Xây dựng API cho hệ thống đổi pin xe điện')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
        })
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, documentFactory());

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 8080;
    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}`);
    logger.log(`Swagger running on: http://localhost:${port}/api/v1/docs`);
}
void bootstrap();
