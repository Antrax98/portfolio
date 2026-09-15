import { Injectable } from '@nestjs/common';
import {
  ProfileProps,
  ProfileUpdateProps,
} from '../../domain/interfaces/profile.interface';
import { ProfileQueryPort } from '../../domain/interfaces/profileQuery.port';
import { ProfileRepositoryPort } from '../../domain/interfaces/profileRepository.port';
import { Profile } from '../../domain/models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profiles: ProfileQueryPort,
    private readonly profileWrites: ProfileRepositoryPort,
  ) {}

  async findMine(userId: number): Promise<ProfileProps> {
    return (await this.profiles.findByUserId(userId)) ?? Profile.empty(userId);
  }

  async updateMine(
    userId: number,
    changes: ProfileUpdateProps,
  ): Promise<ProfileProps> {
    const validated = Profile.validateUpdate(changes);

    return this.profileWrites.upsert(userId, validated);
  }
}
