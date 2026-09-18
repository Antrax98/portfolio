import { Injectable } from '@nestjs/common';
import { InfrastructureException } from '../../../../common/exceptions/infrastructure.exception';
import { ResourceNotFoundException } from '../../../../common/exceptions/resource-not-found.exception';
import { CredentialQueryPort } from '../../../auth/domain/interfaces/credentialQuery.port';
import { ProfileQueryPort } from '../../../profile/domain/interfaces/profileQuery.port';
import { Profile } from '../../../profile/domain/models/profile.model';
import { ProjectQueryPort } from '../../../project/domain/interfaces/projectQuery.port';
import { UserQueryPort } from '../../../user/domain/interfaces/userQuery.port';
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
    const ownerId = await this.credentials.findSoleOwnerUserId();
    if (ownerId === null) {
      throw new ResourceNotFoundException('No portfolio has been set up yet');
    }

    const owner = await this.users.findOneUser({ id: ownerId });
    if (!owner) {
      throw new InfrastructureException(
        `Credential ${ownerId} points at a user that does not exist`,
      );
    }

    const [profile, projects] = await Promise.all([
      this.profiles.findByUserId(ownerId),
      this.projects.findPublishedByUserId(ownerId, query), // (1)
    ]);

    return {
      username: owner.username,
      profile: profile ?? Profile.empty(ownerId),
      projects,
    };
  }
}
