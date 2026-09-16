import type { Profile, UpdateProfileBody } from '../schemas';
import { proxyClient } from './proxyClient';

export const profileApi = {
  get: () => proxyClient<Profile>({ endpoint: '/profile' }),

  update: (body: UpdateProfileBody) =>
    proxyClient<Profile>({ endpoint: '/profile', method: 'PATCH', body }),
};
