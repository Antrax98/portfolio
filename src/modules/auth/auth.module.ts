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

@Module({
  imports: [TypeOrmModule.forFeature([CredentialEntity]), UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: CredentialRepositoryPort,
      useClass: CredentialRepositoryAdapter,
    },
    { provide: CredentialQueryPort, useClass: CredentialQueryAdapter },
  ],
})
export class AuthModule {}
