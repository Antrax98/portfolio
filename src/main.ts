import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApiErrorDetailDto } from './common/swagger/api-error-detail.dto';
import { applyDefaultErrorResponses } from './common/swagger/default-error-responses';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 'port' y no 'PORT': la clave la define configuration.ts, que ya hizo el
  // parseInt y aplicó el default. getOrThrow porque ahí siempre sale un
  // number, así que un undefined sería un error de programación, no un caso
  // a cubrir con un segundo valor por defecto.
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

  await app.listen(port);
}
bootstrap();
