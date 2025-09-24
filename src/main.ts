import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8080;
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);  
}
void bootstrap();
