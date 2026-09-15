import { proxyClient } from '../proxyClient';
import type { IssuedToken, LoginBody } from './schemas';

export const authApi = {
  login: (body: LoginBody) =>
    proxyClient<IssuedToken>({ endpoint: '/auth/login', method: 'POST', body }),

  logout: () => fetch('/api/proxy/logout', { method: 'POST' }),
};
