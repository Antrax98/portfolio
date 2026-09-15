import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './application/services/project.service';
import { ProjectQueryPort } from './domain/interfaces/projectQuery.port';
import { ProjectRepositoryPort } from './domain/interfaces/projectRepository.port';
import { ProjectController } from './infrastructure/controllers/project.controller';
import { ProjectAssetEntity } from './infrastructure/persistences/entities/project-asset.entity';
import { ProjectEntity } from './infrastructure/persistences/entities/project.entity';
import { ProjectQueryAdapter } from './infrastructure/persistences/repositories/project-query.repository';
import { ProjectRepositoryAdapter } from './infrastructure/persistences/repositories/project.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ProjectAssetEntity])],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    { provide: ProjectQueryPort, useClass: ProjectQueryAdapter },
    { provide: ProjectRepositoryPort, useClass: ProjectRepositoryAdapter },
  ],
  exports: [ProjectQueryPort],
})
export class ProjectModule {}
