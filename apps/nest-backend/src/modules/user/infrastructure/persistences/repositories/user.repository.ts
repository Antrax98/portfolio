import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UserNewProps,
  UserProps,
} from '../../../domain/interfaces/user.interface';
import { UserRepositoryPort } from '../../../domain/interfaces/userRepository.port';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(props: UserNewProps): Promise<UserProps> {
    return this.dataSource.manager.save(UserEntity, props);
  }
}
