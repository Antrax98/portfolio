import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CredentialProps } from '../../../domain/interfaces/credential.interface';
import { CredentialQueryPort } from '../../../domain/interfaces/credentialQuery.port';
import { CredentialEntity } from '../entities/credential.entity';

@Injectable()
export class CredentialQueryAdapter implements CredentialQueryPort {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findCredentialByUserId(
    userId: number,
  ): Promise<CredentialProps | null> {
    return this.dataSource.manager.findOne(CredentialEntity, {
      where: { userId },
    });
  }

  async countCredentials(): Promise<number> {
    return this.dataSource.manager.count(CredentialEntity);
  }

  async findSoleOwnerUserId(): Promise<number | null> {
    const rows = await this.dataSource.manager.find(CredentialEntity, {
      select: { userId: true },
      order: { id: 'ASC' },
      take: 2,
    });

    return rows.length === 1 ? rows[0].userId : null;
  }
}
