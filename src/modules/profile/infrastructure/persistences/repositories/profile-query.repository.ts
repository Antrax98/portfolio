import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProfileProps } from '../../../domain/interfaces/profile.interface';
import { ProfileQueryPort } from '../../../domain/interfaces/profileQuery.port';
import { ProfileEntity } from '../entities/profile.entity';
import { toProfileProps } from './profile.mapper';

@Injectable()
export class ProfileQueryAdapter implements ProfileQueryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: number): Promise<ProfileProps | null> {
    const entity = await this.dataSource.manager.findOne(ProfileEntity, {
      where: { userId },
    });

    return entity ? toProfileProps(entity) : null;
  }
}
