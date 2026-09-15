import { Password } from '../value-objects/password.value-object';

export abstract class PasswordHasherPort {
  abstract hash(password: Password): Promise<string>;
  abstract verify(plain: string, hash: string): Promise<boolean>;
}
