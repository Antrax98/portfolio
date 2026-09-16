/** Lo que un TextField necesita: nunca `null`. */
export const text = (value: string | null | undefined): string => value ?? '';

/** Lo que el backend necesita: un texto vacío es un borrado. */
export const nullable = (value: string): string | null =>
  value.trim() === '' ? null : value.trim();

/** `<TextField type="date">` quiere `YYYY-MM-DD`, y el backend devuelve ISO. */
export const toDateInput = (value: string | null): string =>
  value ? value.slice(0, 10) : '';

/**
 * El slug que el backend aceptaría: minúsculas, sin acentos, con guiones.
 *
 * Reproduce en cliente `SLUG_SHAPE` del dominio para que el usuario vea el
 * resultado mientras escribe el título, en vez de descubrirlo tras un 400.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

export const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Los mismos límites que el dominio del backend. */
export const LIMITS = {
  fullName: 120,
  headline: 160,
  location: 120,
  label: 120,
  slug: 140,
  title: 140,
  bio: 10_000,
  description: 10_000,
  links: 10,
  assets: 20,
} as const;
