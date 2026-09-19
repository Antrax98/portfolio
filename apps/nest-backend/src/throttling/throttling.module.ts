import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

/**
 * El límite de peticiones, con su guard.
 *
 * Mismo patrón que `DatabaseModule`: la configuración se queda aquí y
 * `AppModule` solo importa el módulo. El guard viaja con ella — un `APP_GUARD`
 * declarado en cualquier módulo se aplica igual a toda la aplicación, así que
 * no hay motivo para separarlo de lo que lo configura.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      // Vacío pero obligatorio: el tipo lo exige, y ConfigModule ya es global
      // así que no hay nada que importar aquí.
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.getOrThrow<number>('throttle.ttl'),
            limit: configService.getOrThrow<number>('throttle.limit'),
          },
        ],
        // El mensaje por defecto es 'ThrottlerException: Too Many Requests':
        // filtra el nombre de una clase interna y repite el 429 que ya va en
        // `code`. Este dice cuánto falta, que es lo único accionable.
        errorMessage: (_context, detail) =>
          `Too many requests. Try again in ${detail.timeToExpire} seconds`,
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlingModule {}
