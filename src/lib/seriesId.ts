/**
 * Series ids — the /products/… URL segment — shared by the admin forms and the
 * server, so the browser suggests exactly what the server will accept.
 */

/** Lowercase letters, digits and single hyphens, e.g. bath-tub. */
export const SERIES_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** A URL-safe id from a name, or '' when the name has no Latin letters or digits. */
export function slugify(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
