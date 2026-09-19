import { Page, PageQuery } from '../../../../common/interfaces/page.interface';
import { ProjectProps } from './project.interface';

export abstract class ProjectQueryPort {
  abstract findPublishedByUserId(
    userId: number,
    query: PageQuery,
  ): Promise<Page<ProjectProps>>;
  abstract findAllByUserId(userId: number): Promise<ProjectProps[]>;
  abstract findBySlug(
    userId: number,
    slug: string,
  ): Promise<ProjectProps | null>;
  abstract findById(id: number): Promise<ProjectProps | null>;
}
