import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthClaims } from '../../domain/interfaces/auth.interface';
import { AuthTokenPort } from '../../domain/interfaces/authToken.port';

interface JwtPayload {
  sub?: string;
}

@Injectable()
export class JwtTokenAdapter implements AuthTokenPort {
  constructor(private readonly jwt: JwtService) {}

  async issue(claims: AuthClaims): Promise<string> {
    return this.jwt.signAsync({ sub: String(claims.userId) });
  }

  async verify(token: string): Promise<AuthClaims | null> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);

      if (payload.sub === undefined) return null;

      const userId = Number(payload.sub);
      if (!Number.isFinite(userId)) return null;

      return { userId };
    } catch {
      return null;
    }
  }
}
