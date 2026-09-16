import { ProfileProps } from '../../../domain/interfaces/profile.interface';
import { ProfileEntity } from '../entities/profile.entity';

export function toProfileProps(entity: ProfileEntity): ProfileProps {
  return {
    id: entity.id,
    userId: entity.userId,
    fullName: entity.fullName,
    headline: entity.headline,
    bio: entity.bio,
    location: entity.location,
    publicEmail: entity.publicEmail,
    avatarUrl: entity.avatarUrl,
    links: [...(entity.links ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((link) => ({
        kind: link.kind,
        url: link.url,
        label: link.label,
        position: link.position,
      })),
    updatedAt: entity.updatedAt,
  };
}
