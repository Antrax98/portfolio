import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProjectProps } from '../../../domain/interfaces/project.interface';
import { ProjectQueryPort } from '../../../domain/interfaces/projectQuery.port';
import { ProjectEntity } from '../entities/project.entity';
import { toProjectProps } from './project.mapper';
import {
  Page,
  PageQuery,
  toSkipTake,
} from '../../../../../common/interfaces/page.interface';

@Injectable()
export class ProjectQueryAdapter implements ProjectQueryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findPublishedByUserId(
    userId: number,
    query: PageQuery,
  ): Promise<Page<ProjectProps>> {
    const [entities, total] = await this.dataSource.manager.findAndCount(
      ProjectEntity,
      {
        where: { userId, published: true },
        order: { position: 'ASC', id: 'ASC' },
        ...toSkipTake(query),
      },
    );

    return {
      items: entities.map(toProjectProps),
      total,
      page: query.page,
      size: query.size,
    };
  }

  async findAllByUserId(userId: number): Promise<ProjectProps[]> {
    const entities = await this.dataSource.manager.find(ProjectEntity, {
      where: { userId },
      order: { position: 'ASC', id: 'ASC' },
    });

    return entities.map(toProjectProps);
  }

  async findBySlug(userId: number, slug: string): Promise<ProjectProps | null> {
    const entity = await this.dataSource.manager.findOne(ProjectEntity, {
      where: { userId, slug },
    });

    return entity ? toProjectProps(entity) : null;
  }

  async findById(id: number): Promise<ProjectProps | null> {
    const entity = await this.dataSource.manager.findOne(ProjectEntity, {
      where: { id },
    });

    return entity ? toProjectProps(entity) : null;
  }
}
