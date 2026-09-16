import type {
  AssetKind,
  CreateProjectBody,
  LinkKind,
  Profile,
  Project,
  UpdateProfileBody,
  UpdateProjectBody,
} from '../api/schemas';
import { nullable, toDateInput } from './fields';
import { type DraftRow, sameRows, toDrafts, toRowPayload } from './rows';

export interface ProfileValues {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  publicEmail: string;
  avatarUrl: string;
}

export interface ProjectValues {
  slug: string;
  title: string;
  description: string;
  startedAt: string;
  endedAt: string;
  published: boolean;
}

export const profileValuesOf = (profile: Profile): ProfileValues => ({
  fullName: profile.fullName ?? '',
  headline: profile.headline ?? '',
  bio: profile.bio ?? '',
  location: profile.location ?? '',
  publicEmail: profile.publicEmail ?? '',
  avatarUrl: profile.avatarUrl ?? '',
});

export const projectValuesOf = (project: Project): ProjectValues => ({
  slug: project.slug,
  title: project.title,
  description: project.description ?? '',
  startedAt: toDateInput(project.startedAt),
  endedAt: toDateInput(project.endedAt),
  published: project.published,
});

/**
 * Solo las claves que cambiaron.
 *
 * Un campo vaciado se manda como `null` —el backend lo borra— pero solo si
 * antes tenía valor: si ya estaba vacío, no cambió y no se envía. Así `null`
 * nunca viaja "gratis".
 */
export function buildProfilePatch(
  baseline: Profile,
  values: ProfileValues,
  links: DraftRow<LinkKind>[],
): UpdateProfileBody {
  const patch: UpdateProfileBody = {};

  // `fullName` no acepta null en el DTO: es el único que no se puede borrar.
  const fullName = values.fullName.trim();
  if (fullName !== (baseline.fullName ?? '')) patch.fullName = fullName;

  const scalars = [
    ['headline', values.headline, baseline.headline],
    ['bio', values.bio, baseline.bio],
    ['location', values.location, baseline.location],
    ['publicEmail', values.publicEmail, baseline.publicEmail],
    ['avatarUrl', values.avatarUrl, baseline.avatarUrl],
  ] as const;

  for (const [key, value, previous] of scalars) {
    const next = nullable(value);
    if (next !== (previous ?? null)) patch[key] = next;
  }

  const current = toRowPayload(links);
  if (!sameRows(current, toRowPayload(toDrafts(baseline.links)))) {
    patch.links = current;
  }

  return patch;
}

export function buildProjectPatch(
  baseline: Project,
  values: ProjectValues,
  assets: DraftRow<AssetKind>[],
): UpdateProjectBody {
  const patch: UpdateProjectBody = {};

  const slug = values.slug.trim();
  if (slug !== baseline.slug) patch.slug = slug;

  const title = values.title.trim();
  if (title !== baseline.title) patch.title = title;

  const description = nullable(values.description);
  if (description !== (baseline.description ?? null)) {
    patch.description = description;
  }

  const dates = [
    ['startedAt', values.startedAt, baseline.startedAt],
    ['endedAt', values.endedAt, baseline.endedAt],
  ] as const;

  for (const [key, value, previous] of dates) {
    const next = nullable(value);
    if (next !== toDateInput(previous ?? null) || (next === null && previous)) {
      patch[key] = next;
    }
  }

  if (values.published !== baseline.published) {
    patch.published = values.published;
  }

  const current = toRowPayload(assets);
  if (!sameRows(current, toRowPayload(toDrafts(baseline.assets)))) {
    patch.assets = current;
  }

  return patch;
}

/** En creación no hay baseline: se omite lo vacío en vez de mandar `null`. */
export function buildProjectCreate(
  values: ProjectValues,
  assets: DraftRow<AssetKind>[],
): CreateProjectBody {
  const body: CreateProjectBody = {
    slug: values.slug.trim(),
    title: values.title.trim(),
    published: values.published,
  };

  const description = nullable(values.description);
  if (description) body.description = description;

  const startedAt = nullable(values.startedAt);
  if (startedAt) body.startedAt = startedAt;

  const endedAt = nullable(values.endedAt);
  if (endedAt) body.endedAt = endedAt;

  const rows = toRowPayload(assets);
  if (rows.length > 0) body.assets = rows;

  return body;
}
