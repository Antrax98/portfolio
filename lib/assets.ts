import type { AssetKind, ProjectAsset } from './api/schemas';

export const LINK_KINDS = ['repository', 'demo', 'doc'] as const;

export function assetsOf(
  assets: ProjectAsset[],
  ...kinds: AssetKind[]
): ProjectAsset[] {
  return assets.filter((asset) => kinds.includes(asset.kind));
}

/** Texto plano y recortado, para las tarjetas del listado. */
export function excerpt(markdown: string | null, max = 160): string {
  if (!markdown) return '';

  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.length <= max ? plain : `${plain.slice(0, max).trimEnd()}…`;
}
