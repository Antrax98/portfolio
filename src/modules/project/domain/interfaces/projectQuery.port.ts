import { ProjectProps } from './project.interface';

export abstract class ProjectQueryPort {
  abstract findPublishedByUserId(userId: number): Promise<ProjectProps[]>;
  abstract findAllByUserId(userId: number): Promise<ProjectProps[]>;
  abstract findBySlug(
    userId: number,
    slug: string,
  ): Promise<ProjectProps | null>;
  abstract findById(id: number): Promise<ProjectProps | null>;
}
