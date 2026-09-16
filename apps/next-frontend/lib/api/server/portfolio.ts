import 'server-only';

import type { Portfolio } from '../schemas';
import { ApiError, serverFetch } from './serverFetch';

export async function getPortfolio(): Promise<Portfolio | null> {
  try {
    return await serverFetch<Portfolio>({ endpoint: '/portfolio' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
