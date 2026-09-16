import 'server-only';

import { redirect } from 'next/navigation';
import { ApiError } from '../apiError';
import type { Profile, Project } from '../schemas';
import { serverFetch } from './serverFetch';

/**
 * Los datos del panel, con la sesión del propio dueño.
 *
 * Un 401 aquí significa que la cookie existe pero el token murió: `proxy.ts`
 * solo mira que la cookie esté, no que valga. En ese caso al login.
 */
export async function getDashboardData(): Promise<{
  profile: Profile;
  projects: Project[];
}> {
  let data: { profile: Profile; projects: Project[] } | null = null;

  try {
    const [profile, projects] = await Promise.all([
      serverFetch<Profile>({ endpoint: '/profile', auth: true }),
      serverFetch<Project[]>({ endpoint: '/projects', auth: true }),
    ]);

    data = { profile, projects };
  } catch (error) {
    // `redirect()` lanza una excepción que Next intercepta, así que no puede
    // llamarse dentro del catch: la capturaría este mismo bloque.
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  if (!data) redirect('/login');

  return data;
}
