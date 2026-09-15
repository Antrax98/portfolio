import { ProjectProps } from '../../../domain/interfaces/project.interface';
import { ProjectEntity } from '../entities/project.entity';

export function toProjectProps(entity: ProjectEntity): ProjectProps {
  return {
    id: entity.id,
    userId: entity.userId,
    slug: entity.slug,
    title: entity.title,
    description: entity.description,
    startedAt: entity.startedAt,
    endedAt: entity.endedAt,
    published: entity.published,
    position: entity.position,
    assets: [...(entity.assets ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((asset) => ({
        kind: asset.kind,
        url: asset.url,
        label: asset.label,
        position: asset.position,
      })),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
