import { Injectable } from '@nestjs/common';
import { InfrastructureException } from '../../../../common/exceptions/infrastructure.exception';
import { ResourceNotFoundException } from '../../../../common/exceptions/resource-not-found.exception';
import { CredentialQueryPort } from '../../../auth/domain/interfaces/credentialQuery.port';
import { ProfileQueryPort } from '../../../profile/domain/interfaces/profileQuery.port';
import { Profile } from '../../../profile/domain/models/profile.model';
import { ProjectQueryPort } from '../../../project/domain/interfaces/projectQuery.port';
import { UserQueryPort } from '../../../user/domain/interfaces/userQuery.port';
import { ProjectProps } from '../../../project/domain/interfaces/project.interface';
import { PortfolioProps } from '../../domain/interfaces/portfolio.interface';
import { PageQuery } from '../../../../common/interfaces/page.interface';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly credentials: CredentialQueryPort,
    private readonly users: UserQueryPort,
    private readonly profiles: ProfileQueryPort,
    private readonly projects: ProjectQueryPort,
  ) {}

  async findPortfolio(query: PageQuery): Promise<PortfolioProps> {
    const ownerId = await this.requireOwnerId();

    const owner = await this.users.findOneUser({ id: ownerId });
    if (!owner) {
      throw new InfrastructureException(
        `Credential ${ownerId} points at a user that does not exist`,
      );
    }

    const [profile, projects] = await Promise.all([
      this.profiles.findByUserId(ownerId),
      this.projects.findPublishedByUserId(ownerId, query),
    ]);

    return {
      username: owner.username,
      profile: profile ?? Profile.empty(ownerId),
      projects,
    };
  }

  /**
   * Un proyecto publicado por su slug, sin sesión.
   *
   * Existe porque la lista del portafolio está paginada: la página de detalle no
   * puede buscar dentro de ella o solo encontraría los de la primera página.
   */
  async findProject(slug: string): Promise<ProjectProps> {
    const ownerId = await this.requireOwnerId();

    const project = await this.projects.findBySlug(ownerId, slug);
    if (!project || !project.published) {
      // El borrador responde 404 y no 403: un 403 confirmaría que existe.
      throw ResourceNotFoundException.of('Project', 'slug', slug);
    }

    return project;
  }

  private async requireOwnerId(): Promise<number> {
    const ownerId = await this.credentials.findSoleOwnerUserId();
    if (ownerId === null) {
      throw new ResourceNotFoundException('No portfolio has been set up yet');
    }

    return ownerId;
  }
}
