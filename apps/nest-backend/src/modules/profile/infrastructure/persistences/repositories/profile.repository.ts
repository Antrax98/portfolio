import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ProfileProps,
  ProfileUpdateProps,
} from '../../../domain/interfaces/profile.interface';
import { ProfileRepositoryPort } from '../../../domain/interfaces/profileRepository.port';
import { ProfileEntity } from '../entities/profile.entity';
import { ProfileLinkEntity } from '../entities/profile-link.entity';
import { toProfileProps } from './profile.mapper';

@Injectable()
export class ProfileRepositoryAdapter implements ProfileRepositoryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async upsert(
    userId: number,
    changes: ProfileUpdateProps,
  ): Promise<ProfileProps> {
    return this.dataSource.transaction(async (manager) => {
      const current =
        (await manager.findOne(ProfileEntity, { where: { userId } })) ??
        manager.create(ProfileEntity, { userId, fullName: '', links: [] });

      const { links, ...scalars } = changes;
      Object.assign(current, scalars);

      if (links !== undefined) {
        //ver el comentario de project.repository.ts: orphanedRowAction no
        //funciona en TypeORM 1.1.1 y las filas viejas quedaban con el
        //profile_id a NULL. El id falta cuando el perfil aun no existe.
        if (current.id != null) {
          await manager.delete(ProfileLinkEntity, {
            profile: { id: current.id },
          });
        }

        current.links = links.map((link) =>
          manager.create(ProfileLinkEntity, link),
        );
      }

      return toProfileProps(await manager.save(current));
    });
  }
}
