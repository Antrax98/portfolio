import { UserNewProps, UserProps } from '../interfaces/user.interface';

export class User {
  private constructor(
    private readonly id: number,
    private username: string,
    private email: string,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: UserProps): User {
    return new User(
      params.id,
      params.username.trim(),
      User.normalizeEmail(params.email),
      params.createdAt,
      params.updatedAt,
    );
  }

  static createNew(params: UserNewProps): User {
    const now = new Date();

    return User.create({ ...params, id: 0, createdAt: now, updatedAt: now });
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
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
