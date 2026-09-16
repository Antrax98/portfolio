import { ProfileProps } from '../../../profile/domain/interfaces/profile.interface';
import { ProjectProps } from '../../../project/domain/interfaces/project.interface';

export interface PortfolioProps {
  username: string;
  profile: ProfileProps;
  projects: ProjectProps[];
}
