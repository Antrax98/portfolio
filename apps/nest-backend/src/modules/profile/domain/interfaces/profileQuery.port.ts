import { ProfileProps } from './profile.interface';

export abstract class ProfileQueryPort {
  abstract findByUserId(userId: number): Promise<ProfileProps | null>;
}
