import { ProfileDto } from '../../../profile/infrastructure/dtos/profile.dto';
import { ProjectDto, ProjectPageDto } from '../../../project/infrastructure/dtos/project.dto';
import { PortfolioProps } from '../../domain/interfaces/portfolio.interface';

export class PortfolioDto {
  username: string;
  profile: ProfileDto;
  projects: ProjectPageDto;
}