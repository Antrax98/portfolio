import { CredentialProps } from './credential.interface';

export abstract class CredentialQueryPort {
  abstract findCredentialByUserId(
    userId: number,
  ): Promise<CredentialProps | null>;

  abstract countCredentials(): Promise<number>;
}
