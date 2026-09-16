import { proxyClient } from './proxyClient';
import type {
  CredentialSummary,
  IssuedToken,
  LoginBody,
  RegisterBody,
} from '../schemas';

export const authApi = {
  login: (body: LoginBody) =>
    proxyClient<IssuedToken>({ endpoint: '/auth/login', method: 'POST', body }),

  // No devuelve token: registrarse no inicia sesión. El backend cierra este
  // endpoint en cuanto existe una credencial, así que solo funciona una vez.
  register: (body: RegisterBody) =>
    proxyClient<CredentialSummary>({
      endpoint: '/auth/register',
      method: 'POST',
      body,
    }),

  logout: () => fetch('/api/proxy/logout', { method: 'POST' }),
};
