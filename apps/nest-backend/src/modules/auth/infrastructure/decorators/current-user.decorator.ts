import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedCaller } from '../../domain/interfaces/auth.interface';
import { InfrastructureException } from '../../../../common/exceptions/infrastructure.exception';

export const CALLER_KEY = 'authenticatedCaller';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedCaller => {
    const request = context.switchToHttp().getRequest<Request>();
    const caller = (request as Request & Record<string, unknown>)[CALLER_KEY];

    if (!caller) {
      throw new InfrastructureException(
        '@CurrentUser() used on a route the guard did not authenticate',
      );
    }

    return caller as AuthenticatedCaller;
  },
);
