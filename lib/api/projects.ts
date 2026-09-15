import { proxyClient } from '../proxyClient';
import type {
  CreateProjectBody,
  ProjectProps,
  UpdateProjectBody,
} from '../types';

export const projectsApi = {
  list: () => proxyClient<ProjectProps[]>({ endpoint: '/projects' }),

  create: (body: CreateProjectBody) =>
    proxyClient<ProjectProps>({ endpoint: '/projects', method: 'POST', body }),

  update: (slug: string, body: UpdateProjectBody) =>
    proxyClient<ProjectProps>({
      endpoint: `/projects/${slug}`,
      method: 'PATCH',
      body,
    }),

  remove: (slug: string) =>
    proxyClient<void>({ endpoint: `/projects/${slug}`, method: 'DELETE' }),
};
