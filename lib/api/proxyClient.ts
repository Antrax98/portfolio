import type { ApiResponse } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ProxyClientParams {
  endpoint: string;
  method?: HttpMethod;
  body?: unknown;
}

export async function proxyClient<T>({
  endpoint,
  method = 'GET',
  body,
}: ProxyClientParams): Promise<T> {
  const res = await fetch(
    `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
  );

  // Un 401 desde /auth/* son credenciales malas y lo muestra el formulario.
  // Desde cualquier otro sitio significa que la sesión murió.
  if (res.status === 401 && !endpoint.startsWith('/auth/')) {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (res.status === 204) return null as T;

  const envelope = (await res
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    throw new Error(envelope?.message ?? `Error ${res.status}`);
  }

  return envelope?.data as T;
}
