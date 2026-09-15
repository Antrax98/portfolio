import { ProfileProps, ProfileUpdateProps } from './profile.interface';

export abstract class ProfileRepositoryPort {
  abstract upsert(
    userId: number,
    changes: ProfileUpdateProps,
  ): Promise<ProfileProps>;
}
