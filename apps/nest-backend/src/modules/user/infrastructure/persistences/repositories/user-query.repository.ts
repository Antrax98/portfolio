import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere } from 'typeorm';
import {
  UserFilterProps,
  UserProps,
} from '../../../domain/interfaces/user.interface';
import { UserQueryPort } from '../../../domain/interfaces/userQuery.port';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findOneUser(filters: UserFilterProps): Promise<UserProps | null> {
    return this.dataSource.manager.findOne(UserEntity, {
      where: UserQueryAdapter.toWhere(filters),
    });
  }

  async countUsers(filters: UserFilterProps): Promise<number> {
    return this.dataSource.manager.count(UserEntity, {
      where: UserQueryAdapter.toWhere(filters),
    });
  }

  private static toWhere(
    filters: UserFilterProps,
  ): FindOptionsWhere<UserEntity> {
    return Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    );
  }
}
