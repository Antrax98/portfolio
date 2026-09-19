import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApiErrorDetailDto } from './common/swagger/api-error-detail.dto';
import { applyDefaultErrorResponses } from './common/swagger/default-error-responses';
import { validationExceptionFactory } from './common/pipes/validation-exception.factory';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe.js';
import { splash } from './common/console/splash';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('port');

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .setOpenAPIVersion('3.1.0')
    .build();
  const documentFactory = () =>
    applyDefaultErrorResponses(
      SwaggerModule.createDocument(app, config, {
        extraModels: [ApiErrorDetailDto],
      }),
    );
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);

  if (configService.get<string>('nodeEnv') !== 'production') {
    await splash({
      titulo: 'Portfolio',
      lineas: [
        `API:     http://localhost:${port}`,
        `OpenAPI: http://localhost:${port}/api`,
      ],
    });
  }
}
void bootstrap();
