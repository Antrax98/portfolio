import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import {
  ProjectAssetProps,
  ProjectNewProps,
  ProjectProps,
  ProjectUpdateProps,
} from '../../../domain/interfaces/project.interface';
import { ProjectRepositoryPort } from '../../../domain/interfaces/projectRepository.port';
import { ProjectAssetEntity } from '../entities/project-asset.entity';
import { ProjectEntity } from '../entities/project.entity';
import { toProjectProps } from './project.mapper';

@Injectable()
export class ProjectRepositoryAdapter implements ProjectRepositoryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, props: ProjectNewProps): Promise<ProjectProps> {
    return this.dataSource.transaction(async (manager) => {
      const { assets, ...scalars } = props;

      const entity = manager.create(ProjectEntity, { ...scalars, userId });
      entity.assets = this.buildAssets(manager, assets);

      return toProjectProps(await manager.save(entity));
    });
  }

  async update(id: number, changes: ProjectUpdateProps): Promise<ProjectProps> {
    return this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOneOrFail(ProjectEntity, {
        where: { id },
      });

      const { assets, ...scalars } = changes;
      Object.assign(entity, scalars);

      if (assets !== undefined) {
        //el borrado es explicito a proposito. Las entidades declaran
        //orphanedRowAction: 'delete', pero TypeORM 1.1.1 lo ignora: detecta las
        //filas que sobran y les pone el project_id a NULL en vez de borrarlas,
        //asi que cada edicion dejaba basura invisible en la tabla.
        await manager.delete(ProjectAssetEntity, { project: { id } });
        entity.assets = this.buildAssets(manager, assets);
      }

      return toProjectProps(await manager.save(entity));
    });
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.manager.delete(ProjectEntity, { id });
  }

  private buildAssets(
    manager: EntityManager,
    assets: ProjectAssetProps[] | undefined,
  ): ProjectAssetEntity[] {
    return (assets ?? []).map((asset) =>
      manager.create(ProjectAssetEntity, asset),
    );
  }
}
