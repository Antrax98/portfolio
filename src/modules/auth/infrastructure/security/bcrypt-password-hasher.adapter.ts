import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PasswordHasherPort } from '../../domain/interfaces/passwordHasher.port';
import { Password } from '../../domain/value-objects/password.value-object';

const COST_FACTOR = 12;

@Injectable()
export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  async hash(password: Password): Promise<string> {
    return hash(password.value, COST_FACTOR);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
