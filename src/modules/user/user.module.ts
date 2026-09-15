import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/services/user.service';
import { UserQueryPort } from './domain/interfaces/userQuery.port';
import { UserRepositoryPort } from './domain/interfaces/userRepository.port';
import { UserEntity } from './infrastructure/persistences/entities/user.entity';
import { UserQueryAdapter } from './infrastructure/persistences/repositories/user-query.repository';
import { UserRepositoryAdapter } from './infrastructure/persistences/repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    UserService,
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    { provide: UserQueryPort, useClass: UserQueryAdapter },
  ],
  exports: [UserQueryPort, UserService],
})
export class UserModule {}
