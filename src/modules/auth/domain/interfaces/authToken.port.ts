import { AuthClaims } from './auth.interface';

export abstract class AuthTokenPort {
  abstract issue(claims: AuthClaims): Promise<string>;
  abstract verify(token: string): Promise<AuthClaims | null>;
}
