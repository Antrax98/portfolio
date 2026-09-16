import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './application/services/profile.service';
import { ProfileQueryPort } from './domain/interfaces/profileQuery.port';
import { ProfileRepositoryPort } from './domain/interfaces/profileRepository.port';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { ProfileEntity } from './infrastructure/persistences/entities/profile.entity';
import { ProfileLinkEntity } from './infrastructure/persistences/entities/profile-link.entity';
import { ProfileQueryAdapter } from './infrastructure/persistences/repositories/profile-query.repository';
import { ProfileRepositoryAdapter } from './infrastructure/persistences/repositories/profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity, ProfileLinkEntity])],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    { provide: ProfileQueryPort, useClass: ProfileQueryAdapter },
    { provide: ProfileRepositoryPort, useClass: ProfileRepositoryAdapter },
  ],
  exports: [ProfileQueryPort],
})
export class ProfileModule {}
