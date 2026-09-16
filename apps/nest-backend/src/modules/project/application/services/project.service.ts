import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../../../common/exceptions/resource-not-found.exception';
import { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import {
  ProjectNewProps,
  ProjectProps,
  ProjectUpdateProps,
} from '../../domain/interfaces/project.interface';
import { ProjectQueryPort } from '../../domain/interfaces/projectQuery.port';
import { ProjectRepositoryPort } from '../../domain/interfaces/projectRepository.port';
import { Project } from '../../domain/models/project.model';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projects: ProjectQueryPort,
    private readonly projectWrites: ProjectRepositoryPort,
  ) {}

  async listMine(caller: AuthenticatedCaller): Promise<ProjectProps[]> {
    return this.projects.findAllByUserId(caller.userId);
  }

  async create(
    caller: AuthenticatedCaller,
    params: ProjectNewProps,
  ): Promise<ProjectProps> {
    const validated = Project.validate(params) as ProjectNewProps;

    return this.projectWrites.create(caller.userId, validated);
  }

  async update(
    caller: AuthenticatedCaller,
    slug: string,
    changes: ProjectUpdateProps,
  ): Promise<ProjectProps> {
    const project = await this.findOwned(caller, slug);
    const validated = Project.validate(changes);

    return this.projectWrites.update(project.id, validated);
  }

  async delete(caller: AuthenticatedCaller, slug: string): Promise<void> {
    const project = await this.findOwned(caller, slug);

    await this.projectWrites.delete(project.id);
  }

  private async findOwned(
    caller: AuthenticatedCaller,
    slug: string,
  ): Promise<ProjectProps> {
    const project = await this.projects.findBySlug(caller.userId, slug);
    if (!project) {
      throw ResourceNotFoundException.of('Project', 'slug', slug);
    }

    Project.assertOwnedBy(project, caller);

    return project;
  }
}
