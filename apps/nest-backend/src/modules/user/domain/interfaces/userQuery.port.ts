import { UserFilterProps, UserProps } from './user.interface';

export abstract class UserQueryPort {
  abstract findOneUser(filters: UserFilterProps): Promise<UserProps | null>;

  //aparte de findOneUser porque aquel compone los filtros con AND y aqui hace
  //falta un OR: el identificador es uno solo y puede ser cualquiera de los dos
  abstract findOneUserByEmailOrUsername(
    identifier: string,
  ): Promise<UserProps | null>;
  abstract countUsers(filters: UserFilterProps): Promise<number>;
}
