import { ProfileDto } from '../../../profile/infrastructure/dtos/profile.dto';
import { ProjectPageDto } from '../../../project/infrastructure/dtos/project.dto';
import { PortfolioProps } from '../../domain/interfaces/portfolio.interface';

export class PortfolioDto implements PortfolioProps {
  username: string;
  profile: ProfileDto;
  projects: ProjectPageDto;
}