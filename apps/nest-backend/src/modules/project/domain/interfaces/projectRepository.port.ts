import {
  ProjectNewProps,
  ProjectProps,
  ProjectUpdateProps,
} from './project.interface';

export abstract class ProjectRepositoryPort {
  abstract create(
    userId: number,
    props: ProjectNewProps,
  ): Promise<ProjectProps>;
  abstract update(
    id: number,
    changes: ProjectUpdateProps,
  ): Promise<ProjectProps>;
  abstract delete(id: number): Promise<void>;
}
