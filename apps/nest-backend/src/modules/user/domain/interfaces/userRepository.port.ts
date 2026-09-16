import { UserNewProps, UserProps } from './user.interface';

export abstract class UserRepositoryPort {
  abstract create(props: UserNewProps): Promise<UserProps>;
}
