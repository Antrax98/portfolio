import type { Portfolio } from '../schemas';
import { proxyClient } from './proxyClient';

export const portfolioApi = {
  page: (page: number, size: number) =>
    proxyClient<Portfolio>({
      endpoint: `/portfolio?page=${page}&size=${size}`,
    }),
};