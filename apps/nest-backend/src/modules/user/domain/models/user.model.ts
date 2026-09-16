import { DomainErrorCollector } from '../../../../common/domain/error-collector';
import { UserNewProps, UserProps } from '../interfaces/user.interface';

const MAX_USERNAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  private constructor(
    private readonly id: number,
    private username: string,
    private email: string,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: UserProps): User {
    const errors = new DomainErrorCollector();

    const username = User.normalizeUsername(params.username);
    const email = User.normalizeEmail(params.email);

    User.collectUsernameErrors(errors, username);
    User.collectEmailErrors(errors, email);

    errors.throwIfAny('The user could not be built: some data is invalid');

    return new User(
      params.id,
      username,
      email,
      params.createdAt,
      params.updatedAt,
    );
  }

  static createNew(params: UserNewProps): User {
    const now = new Date();

    return User.create({ ...params, id: 0, createdAt: now, updatedAt: now });
  }

  private static collectUsernameErrors(
    errors: DomainErrorCollector,
    username: string,
  ): void {
    if (username.length === 0) {
      errors.add('username', 'Username is required');
      return;
    }

    if (username.length > MAX_USERNAME_LENGTH) {
      errors.add(
        'username',
        `Username cannot be longer than ${MAX_USERNAME_LENGTH} characters`,
      );
    }
  }

  private static collectEmailErrors(
    errors: DomainErrorCollector,
    email: string,
  ): void {
    if (email.length === 0) {
      errors.add('email', 'Email is required');
      return;
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      errors.add(
        'email',
        `Email cannot be longer than ${MAX_EMAIL_LENGTH} characters`,
      );
      return;
    }

    if (!EMAIL_SHAPE.test(email)) {
      errors.add('email', 'Email is not a valid address');
    }
  }

  private static normalizeUsername(username: string): string {
    return typeof username === 'string' ? username.trim() : '';
  }

  private static normalizeEmail(email: string): string {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  toPersistence(): UserNewProps {
    return { username: this.username, email: this.email };
  }

  toProps(): UserProps {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
