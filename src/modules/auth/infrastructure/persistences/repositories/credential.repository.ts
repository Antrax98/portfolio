import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CredentialNewProps,
  CredentialProps,
} from '../../../domain/interfaces/credential.interface';
import { CredentialRepositoryPort } from '../../../domain/interfaces/credentialRepository.port';
import { CredentialEntity } from '../entities/credential.entity';

@Injectable()
export class CredentialRepositoryAdapter implements CredentialRepositoryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(props: CredentialNewProps): Promise<CredentialProps> {
    return this.dataSource.manager.save(CredentialEntity, props);
  }
}
