import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../application/services/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CALLER_KEY } from '../decorators/current-user.decorator';
import { Request } from 'express';

const BEARER_PREFIX = /^Bearer\s+(.+)$/i;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // (1)
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const caller = await this.authService.authorizeRequest(
      this.readToken(request),
    );

    (request as Request & Record<string, unknown>)[CALLER_KEY] = caller;

    return true; // (2)
  }

  private readToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;

    const match = BEARER_PREFIX.exec(header.trim());
    return match ? match[1].trim() : null;
  }
}
