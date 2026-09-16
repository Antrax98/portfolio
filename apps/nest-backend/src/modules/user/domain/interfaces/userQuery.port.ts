import { UserFilterProps, UserProps } from './user.interface';

export abstract class UserQueryPort {
  abstract findOneUser(filters: UserFilterProps): Promise<UserProps | null>;
  abstract countUsers(filters: UserFilterProps): Promise<number>;
}
