import { createClient, type SanityClient } from '@sanity/client'
import { SERIES_ID_PATTERN, slugify } from './seriesId'

/**
 * Series and products, as the serial library sees them — and the drafts it
 * creates when a delivery names one the CMS has never heard of.
 *
 * A serial import is often the first the site hears of a new product line, so
 * the import can start its pages: a draft productSeries for a new series and a
 * draft product for each new model. Drafts only — the site reads the published
 * perspective, so nothing appears until someone fills in the page and presses
 * publish in the Studio. That is deliberate: an import knows a name and a code,
 * not a hero image or a word of copy, and an empty page published by a CSV
 * would be worse than no page.
 *
 * Server-only: it writes with the API token.
 */

export { SERIES_ID_PATTERN, slugify }

export interface CatalogSeries {
  /** Published id, without the drafts. prefix. */
  id: string
  seriesId: string
  name: string
  published: boolean
}

export interface CatalogProduct {
  id: string
  name: string
  modelCode: string | null
  series: string | null
  slug: string | null
  published: boolean
}

export interface Catalog {
  series: CatalogSeries[]
  products: CatalogProduct[]
}

let writer: SanityClient | null = null
function sanity(): SanityClient {
  if (!writer) {
    writer = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      // Fresh, and drafts included: a series created by this morning's import
      // must be offered to this afternoon's, published or not.
      useCdn: false,
      perspective: 'raw',
    })
  }
  return writer
}

const baseId = (id: string) => id.replace(/^drafts\./, '')

/** Series and products, drafts folded into the document they belong to. */
export async function loadCatalog(): Promise<Catalog> {
  const docs: Array<{
    _id: string
    _type: string
    seriesId?: string
    name?: string
    modelCode?: string
    series?: string
    slug?: string
  }> = await sanity().fetch(
    `*[_type in ["productSeries", "product"]] {
      _id, _type, seriesId, name, modelCode, series, "slug": slug.current
    }`
  )

  // The draft carries the latest edits, so it wins over the published copy;
  // "published" records whether a published copy exists at all.
  const merged = new Map<string, (typeof docs)[number] & { published: boolean }>()
  for (const doc of docs) {
    const id = baseId(doc._id)
    const isDraft = doc._id !== id
    const existing = merged.get(id)
    const published = (existing?.published ?? false) || !isDraft
    merged.set(id, { ...(isDraft || !existing ? doc : existing), published })
  }

  const all = [...merged.entries()].map(([id, doc]) => ({ id, ...doc }))
  return {
    series: all
      .filter((d) => d._type === 'productSeries' && d.seriesId)
      .map((d) => ({ id: d.id, seriesId: d.seriesId!, name: d.name || d.seriesId!, published: d.published }))
      .sort((a, b) => a.seriesId.localeCompare(b.seriesId)),
    products: all
      .filter((d) => d._type === 'product')
      .map((d) => ({
        id: d.id,
        name: d.name ?? '',
        modelCode: d.modelCode ?? null,
        series: d.series ?? null,
        slug: d.slug ?? null,
        published: d.published,
      })),
  }
}

/** The series for the admin dropdowns. An unreachable CMS gives an empty list, not an error page. */
export async function listSeriesOptions(): Promise<{ seriesId: string; name: string; published: boolean }[]> {
  try {
    return (await loadCatalog()).series.map(({ seriesId, name, published }) => ({ seriesId, name, published }))
  } catch (err) {
    console.error('[catalog] could not list series', err)
    return []
  }
}

/** Width, case and spacing folded away, so "Ｘ４０" and "x40" are one model. */
const fold = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s　]/g, '')

/** The series a CSV cell means — by its id, or by its name as the Studio shows it. */
export function findSeries(catalog: Catalog, value: string | null | undefined): CatalogSeries | null {
  if (!value?.trim()) return null
  const key = fold(value)
  return catalog.series.find((s) => fold(s.seriesId) === key || fold(s.name) === key) ?? null
}

/**
 * The product a serial's model cell refers to. The factory writes the bare
 * model — "X40" — where the CMS has "X40-B スマートトイレ" and a full code, so
 * a product whose name or code starts with the cell counts as a match.
 */
export function findProduct(catalog: Catalog, model: string | null | undefined): CatalogProduct | null {
  if (!model?.trim()) return null
  const key = fold(model)
  return (
    catalog.products.find((p) => fold(p.name) === key || (p.modelCode && fold(p.modelCode) === key)) ??
    catalog.products.find((p) => fold(p.name).startsWith(key) || (p.modelCode && fold(p.modelCode).startsWith(key))) ??
    null
  )
}

export interface NewSeriesProposal {
  /** The value as written in the file. */
  key: string
  /** Suggested id and name; staff confirm or change both before anything is written. */
  seriesId: string
  name: string
  serials: number
}

export interface NewModelProposal {
  model: string
  /** The series key as written in the file, if the rows gave one. */
  seriesKey: string | null
  serials: number
}

export interface CatalogPlan {
  newSeries: NewSeriesProposal[]
  newModels: NewModelProposal[]
}

/** What in this batch of serials the CMS does not have yet. */
export function planCatalog(
  catalog: Catalog,
  rows: { series?: string | null; modelName?: string | null }[]
): CatalogPlan {
  const series = new Map<string, NewSeriesProposal>()
  const models = new Map<string, NewModelProposal>()

  for (const row of rows) {
    const seriesKey = row.series?.trim() || null
    if (seriesKey && !findSeries(catalog, seriesKey)) {
      const entry = series.get(seriesKey)
      if (entry) entry.serials++
      else {
        // A Latin value reads as the id and needs a display name; a Japanese
        // one reads as the name and needs an id. Either way staff see both.
        const asId = slugify(seriesKey)
        series.set(seriesKey, {
          key: seriesKey,
          seriesId: asId,
          name: SERIES_ID_PATTERN.test(seriesKey) ? '' : seriesKey,
          serials: 1,
        })
      }
    }

    const model = row.modelName?.trim()
    if (model && !findProduct(catalog, model)) {
      const id = `${fold(model)}|${seriesKey ?? ''}`
      const entry = models.get(id)
      if (entry) entry.serials++
      else models.set(id, { model, seriesKey, serials: 1 })
    }
  }

  return { newSeries: [...series.values()], newModels: [...models.values()] }
}

/** The Studio's edit view for a document, by intent so it survives structure changes. */
export const studioUrl = (id: string, type: 'productSeries' | 'product') =>
  `/studio/intent/edit/id=${id};type=${type}/`

export interface CreatedDraft {
  kind: 'series' | 'product'
  id: string
  name: string
  studioUrl: string
  /** False when a document by this id was already there and was left alone. */
  created: boolean
}

export interface SeriesDecision {
  seriesId: string
  name: string
}

export interface ProductDecision {
  model: string
  seriesId: string | null
}

/**
 * Writes draft documents for the series and models staff confirmed.
 *
 * createIfNotExists throughout: re-running an import, or two admins confirming
 * the same new series at once, must never overwrite a page someone has started
 * writing. A series id already in the CMS is reused rather than duplicated.
 */
export async function createCatalogDrafts(
  catalog: Catalog,
  decision: { series: SeriesDecision[]; products: ProductDecision[] }
): Promise<CreatedDraft[]> {
  const created: CreatedDraft[] = []
  const tx = sanity().transaction()

  for (const s of decision.series) {
    const existing = catalog.series.find((c) => c.seriesId === s.seriesId)
    if (existing) {
      created.push({ kind: 'series', id: existing.id, name: existing.name, studioUrl: studioUrl(existing.id, 'productSeries'), created: false })
      continue
    }
    const id = `series-${s.seriesId}`
    tx.createIfNotExists({
      _id: `drafts.${id}`,
      _type: 'productSeries',
      seriesId: s.seriesId,
      name: s.name,
      showInNavigation: true,
    })
    created.push({ kind: 'series', id, name: s.name, studioUrl: studioUrl(id, 'productSeries'), created: true })
  }

  const usedSlugs = new Set(catalog.products.map((p) => p.slug).filter(Boolean))
  const usedIds = new Set(catalog.products.map((p) => p.id))
  for (const p of decision.products) {
    const existing = findProduct(catalog, p.model)
    if (existing) {
      created.push({ kind: 'product', id: existing.id, name: existing.name, studioUrl: studioUrl(existing.id, 'product'), created: false })
      continue
    }

    // The model's own letters make the URL where it has any (X50 → x50);
    // a model written only in Japanese gets the series plus a counter.
    const base = slugify(p.model) || `${p.seriesId ?? 'product'}-model`
    let slug = base
    for (let n = 2; usedSlugs.has(slug) || usedIds.has(`product-${slug}`); n++) slug = `${base}-${n}`
    usedSlugs.add(slug)
    const id = `product-${slug}`
    usedIds.add(id)

    tx.createIfNotExists({
      _id: `drafts.${id}`,
      _type: 'product',
      name: p.model,
      // The factory's model is the best code there is until staff enter the
      // full one; it is what the registration dropdown shows beside the name.
      modelCode: p.model,
      ...(p.seriesId && { series: p.seriesId }),
      slug: { _type: 'slug', current: slug },
      isActive: true,
    })
    created.push({ kind: 'product', id, name: p.model, studioUrl: studioUrl(id, 'product'), created: true })
  }

  if (created.some((c) => c.created)) await tx.commit()
  return created
}
