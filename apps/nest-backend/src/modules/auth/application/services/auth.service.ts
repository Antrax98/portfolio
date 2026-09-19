import { UnauthenticatedException } from '../../../../common/exceptions/unauthenticated.exception';
import { Injectable } from '@nestjs/common';
import {
  AuthenticatedCaller,
  IssuedToken,
  LoginProps,
  RegisterProps,
} from '../../domain/interfaces/auth.interface';
import { CredentialSummary } from '../../domain/interfaces/credential.interface';
import { UserQueryPort } from '../../../user/domain/interfaces/userQuery.port';
import { Password } from '../../domain/value-objects/password.value-object';
import { CredentialQueryPort } from '../../domain/interfaces/credentialQuery.port';
import { CredentialRepositoryPort } from '../../domain/interfaces/credentialRepository.port';
import { PasswordHasherPort } from '../../domain/interfaces/passwordHasher.port';
import { AuthTokenPort } from '../../domain/interfaces/authToken.port';
import { UserService } from '../../../user/application/services/user.service';
import { BusinessException } from '../../../../common/exceptions/business.exception';

const INVALID_CREDENTIALS = 'Invalid credentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserQueryPort,
    private readonly userService: UserService,
    private readonly credentialReads: CredentialQueryPort,
    private readonly credentials: CredentialRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly tokens: AuthTokenPort,
  ) {}

  async login(params: LoginProps): Promise<IssuedToken> {
    const user = await this.users.findOneUserByEmailOrUsername(
      params.identifier,
    );
    if (!user) throw new UnauthenticatedException(INVALID_CREDENTIALS);

    const credential = await this.credentialReads.findCredentialByUserId(
      user.id,
    );
    if (!credential) throw new UnauthenticatedException(INVALID_CREDENTIALS);

    const matches = await this.hasher.verify(
      params.password,
      credential.passwordHash,
    );
    if (!matches) throw new UnauthenticatedException(INVALID_CREDENTIALS);

    return { token: await this.tokens.issue({ userId: user.id }) };
  }

  async register(params: RegisterProps): Promise<CredentialSummary> {
    const exist = (await this.credentialReads.countCredentials()) > 0;
    if (exist)
      throw new BusinessException('There is already an user registered');

    const password = Password.create(params.password);

    const existing = await this.users.findOneUser({ email: params.email });
    //aqui se crea el usuario al registrarse
    //TODO: investigar forma de separarlo?
    //userService se asegura de validar la creacion de usuario, no auth
    const user =
      existing ??
      (await this.userService.createUser({
        username: params.username,
        email: params.email,
      }));

    const passwordHash = await this.hasher.hash(password);

    const credential = await this.credentials.create({
      userId: user.id,
      passwordHash,
    });

    return { userId: credential.userId, createdAt: credential.createdAt };
  }

  async authorizeRequest(token: string | null): Promise<AuthenticatedCaller> {
    if (!token) throw new UnauthenticatedException('Authentication required');

    const claims = await this.tokens.verify(token);
    if (!claims) throw new UnauthenticatedException('Authentication required');

    return { userId: claims.userId };
  }
}
