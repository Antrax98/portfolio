import { CredentialNewProps, CredentialProps } from './credential.interface';

export abstract class CredentialRepositoryPort {
  abstract create(props: CredentialNewProps): Promise<CredentialProps>;
}
