import { proxyClient } from './proxyClient';
import type { CreateProjectBody, Project, UpdateProjectBody } from '../schemas';

export const projectsApi = {
  list: () => proxyClient<Project[]>({ endpoint: '/projects' }),

  create: (body: CreateProjectBody) =>
    proxyClient<Project>({ endpoint: '/projects', method: 'POST', body }),

  update: (slug: string, body: UpdateProjectBody) =>
    proxyClient<Project>({
      endpoint: `/projects/${slug}`,
      method: 'PATCH',
      body,
    }),

  remove: (slug: string) =>
    proxyClient<void>({ endpoint: `/projects/${slug}`, method: 'DELETE' }),
};
