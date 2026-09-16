import { InfrastructureException } from '../../common/exceptions/infrastructure.exception';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthService } from './application/services/auth.service';
import { CredentialQueryPort } from './domain/interfaces/credentialQuery.port';
import { CredentialRepositoryPort } from './domain/interfaces/credentialRepository.port';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { CredentialEntity } from './infrastructure/persistences/entities/credential.entity';
import { CredentialQueryAdapter } from './infrastructure/persistences/repositories/credential-query.repository';
import { CredentialRepositoryAdapter } from './infrastructure/persistences/repositories/credential.repository';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { PasswordHasherPort } from './domain/interfaces/passwordHasher.port';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { AuthTokenPort } from './domain/interfaces/authToken.port';
import { JwtTokenAdapter } from './infrastructure/security/jwt-token.adapter';

function buildJwtOptions(configService: ConfigService): JwtModuleOptions {
  const secret = configService.get<string>('auth.jwt_secret');

  if (!secret) {
    throw new InfrastructureException('JWT_SECRET is not set');
  }

  const expiresIn = configService.get<string>('auth.jwt_expires_in');

  return {
    secret,
    signOptions: { expiresIn: expiresIn as JwtSignOptions['expiresIn'] },
  };
}

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: buildJwtOptions,
    }),
    TypeOrmModule.forFeature([CredentialEntity]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PasswordHasherPort, useClass: BcryptPasswordHasherAdapter },
    { provide: AuthTokenPort, useClass: JwtTokenAdapter },
    {
      provide: CredentialRepositoryPort,
      useClass: CredentialRepositoryAdapter,
    },
    { provide: CredentialQueryPort, useClass: CredentialQueryAdapter },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [JwtModule, CredentialQueryPort],
})
export class AuthModule {}
