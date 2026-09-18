import 'server-only';

import type { Portfolio, Project } from '../schemas';
import { ApiError, serverFetch } from './serverFetch';

export async function getPortfolio(): Promise<Portfolio | null> {
  try {
    return await serverFetch<Portfolio>({ endpoint: '/portfolio' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Un proyecto publicado por su slug.
 *
 * No se busca dentro de `getPortfolio()` porque esa lista está paginada: solo
 * encontraría los de la primera página, y el enlace roto estaría en la portada.
 */
export async function getProject(slug: string): Promise<Project | null> {
  try {
    return await serverFetch<Project>({
      endpoint: `/portfolio/projects/${encodeURIComponent(slug)}`,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
