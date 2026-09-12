import { Module } from '@nestjs/common';
import { ProjectService } from './application/services/project.service';
import { ProjectController } from './infrastructure/controllers/project.controller';

@Module({
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
