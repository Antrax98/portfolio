import { Injectable } from '@nestjs/common';
import {
  UserNewProps,
  UserProps,
} from '../../domain/interfaces/user.interface';
import { UserRepositoryPort } from '../../domain/interfaces/userRepository.port';
import { User } from '../../domain/models/user.model';

@Injectable()
export class UserService {
  constructor(private readonly users: UserRepositoryPort) {}

  async createUser(params: UserNewProps): Promise<UserProps> {
    const draft = User.createNew(params);

    return this.users.create(draft.toPersistence());
  }

  
}
