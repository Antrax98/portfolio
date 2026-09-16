import type { AssetKind, LinkKind } from '../api/schemas';

/** Una fila del editor. El `uid` es local de React y no viaja al backend. */
export interface DraftRow<K extends string> {
  uid: string;
  kind: K;
  url: string;
  label: string;
}

/** Lo que espera el backend. `position` sale del índice. */
export interface RowPayload<K extends string> {
  kind: K;
  url: string;
  label: string | null;
  position: number;
}

interface SourceRow<K extends string> {
  kind: K;
  url: string;
  label: string | null;
}

/**
 * Los uid son un contador y no `crypto.randomUUID()`: el componente también se
 * renderiza en el servidor durante el SSR, y un valor aleatorio distinto en cada
 * lado invita a problemas de hidratación.
 */
export function toDrafts<K extends string>(
  rows: SourceRow<K>[],
): DraftRow<K>[] {
  return rows.map((row, index) => ({
    uid: `r${index}`,
    kind: row.kind,
    url: row.url,
    label: row.label ?? '',
  }));
}

export function toRowPayload<K extends string>(
  rows: DraftRow<K>[],
): RowPayload<K>[] {
  return rows.map((row, index) => ({
    kind: row.kind,
    url: row.url.trim(),
    label: row.label.trim() === '' ? null : row.label.trim(),
    position: index,
  }));
}

export function moveRow<T>(rows: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= rows.length) return rows;

  const moved = [...rows];
  [moved[index], moved[target]] = [moved[target], moved[index]];

  return moved;
}

export function sameRows<K extends string>(
  a: RowPayload<K>[],
  b: RowPayload<K>[],
): boolean {
  if (a.length !== b.length) return false;

  return a.every(
    (row, index) =>
      row.kind === b[index].kind &&
      row.url === b[index].url &&
      row.label === b[index].label,
  );
}

export const LINK_KIND_OPTIONS: { value: LinkKind; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'web', label: 'Web' },
  { value: 'email', label: 'Correo' },
  { value: 'other', label: 'Otro' },
];

export const ASSET_KIND_OPTIONS: { value: AssetKind; label: string }[] = [
  { value: 'repository', label: 'Repositorio' },
  { value: 'demo', label: 'Demo' },
  { value: 'doc', label: 'Documentación' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
];
