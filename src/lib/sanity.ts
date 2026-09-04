import { createClient, type SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

function createSanityClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')

  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
    token: process.env.SANITY_API_TOKEN,
  })
}

let _client: SanityClient | null = null
export function getSanityClient(): SanityClient {
  if (!_client) _client = createSanityClient()
  return _client
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return imageUrlBuilder(getSanityClient()).image(source)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function imgUrl(source: any, width: number, quality = 82): string {
  const ref: string = source?._ref ?? ''
  const builder = urlFor(source).width(width)
  // GIF refs end with '-gif'; converting to WebP strips animation
  return ref.endsWith('-gif')
    ? builder.url()
    : builder.format('webp').quality(quality).url()
}

// Fetch all active products for the model dropdown
export interface ProductModel {
  _id: string
  name: string
  modelCode: string
  /** Drives the serial number length — see lib/serialValidation.ts. */
  series: string
}

export async function getProductModels(): Promise<ProductModel[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "product" && isActive == true && defined(modelCode)] | order(name asc) {
        _id,
        "name": coalesce(name, "Unknown"),
        modelCode,
        series
      }`
    )
  } catch {
    return []
  }
}

/** A Sanity image/file reference resolved to a URL by the query. */
export interface AssetRef {
  _ref: string
  _type: string
}

export interface ProductVideo {
  embedUrl: string
  title: string
}

export interface SpecRow {
  /** Groups consecutive rows under a shared sub-heading. */
  subgroup?: string
  label: string
  value: string
}

export interface SpecGroup {
  /** Optional — an untitled group renders as plain rows at the top of the table. */
  title?: string
  rows: SpecRow[]
}

export interface FeatureCard {
  /** Newline-separated in Sanity; split into rendered lines. */
  title: string
  body?: string
  image?: { asset?: AssetRef }
}

export interface StandardGroup {
  title: string
  items: string[]
}

export interface ProductHero {
  eyebrow?: string
  title?: string
  catchphrase?: string
  image?: { asset?: AssetRef }
}

export interface ProductCard {
  image?: { asset?: AssetRef }
  hoverImage?: { asset?: AssetRef }
  description?: string
}

export interface ProductDetail {
  _id: string
  modelCode: string
  series: string
  name: string
  slug: { current: string }
  tagline?: string
  hero?: ProductHero
  longDescription?: unknown[]
  featureCards?: FeatureCard[]
  standardGroups?: StandardGroup[]
  specGroups?: SpecGroup[]
  specNote?: string
  specImage?: { asset?: AssetRef }
  images?: Array<{ _key: string; asset: AssetRef; alt?: string; caption?: string }>
  model3dUrl?: string
  price?: string
  card?: ProductCard
  featureVideos?: ProductVideo[]
}

const PRODUCT_DETAIL_PROJECTION = `
  _id, modelCode, series,
  name, slug, tagline,
  hero { eyebrow, title, catchphrase, image },
  longDescription,
  featureCards[] { title, body, image },
  standardGroups[] { title, items },
  specGroups[] { title, rows[] { subgroup, label, value } },
  specNote,
  specImage,
  images[] { _key, asset, alt, caption },
  "model3dUrl": model3d.asset->url,
  price,
  card { image, hoverImage, description },
  featureVideos[] { embedUrl, title }
`

export async function getProductDetail(series: string, slug: string): Promise<ProductDetail | null> {
  try {
    const result = await getSanityClient().fetch(
      `*[_type == "product" && series == $series && slug.current == $slug][0] {${PRODUCT_DETAIL_PROJECTION}}`,
      { series, slug }
    )
    return result ?? null
  } catch {
    return null
  }
}

export async function getProductSlugs(series: string): Promise<string[]> {
  try {
    const results = await getSanityClient().fetch(
      `*[_type == "product" && series == $series && defined(slug.current)] { "slug": slug.current }`,
      { series }
    )
    return results.map((r: { slug: string }) => r.slug)
  } catch {
    return []
  }
}

export interface SeriesLineup {
  eyebrow?: string
  title?: string
  /** Newline-separated in Sanity; split into rendered lines. */
  subtitle?: string
}

export interface SeriesProductDefaults {
  heroEyebrow?: string
  heroCatchphrase?: string
  heroImage?: { asset?: AssetRef }
  /** Trailing words stripped off the product name to get the bare model name. */
  nameSuffix?: string
}

export interface SeriesPageData {
  _id: string
  seriesId: string
  name: string
  tagline?: string
  description?: string
  lineup?: SeriesLineup
  productDefaults?: SeriesProductDefaults
}

const SERIES_PROJECTION = `
  _id, seriesId, name, tagline, description,
  lineup { eyebrow, title, subtitle },
  productDefaults { heroEyebrow, heroCatchphrase, heroImage, nameSuffix }
`

export async function getSeriesPage(seriesId: string): Promise<SeriesPageData | null> {
  try {
    const result = await getSanityClient().fetch(
      `*[_type == "productSeries" && seriesId == $seriesId][0] {${SERIES_PROJECTION}}`,
      { seriesId }
    )
    return result ?? null
  } catch {
    return null
  }
}

export interface ProductSummary {
  _id: string
  slug: string
  name: string
  tagline?: string
  modelCode: string
  thumbnail?: AssetRef
  heroTitle?: string
  heroEyebrow?: string
  card?: ProductCard
}

export async function getProductsInSeries(series: string): Promise<ProductSummary[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "product" && series == $series && defined(slug.current)] | order(slug.current asc) {
        _id,
        "slug": slug.current,
        name,
        tagline,
        modelCode,
        "thumbnail": images[0].asset,
        "heroTitle": hero.title,
        "heroEyebrow": hero.eyebrow,
        card { image, hoverImage, description }
      }`,
      { series }
    )
  } catch {
    return []
  }
}

/* ── Legal documents ─────────────────────────────────────────
   The privacy policy and the ご利用条件, edited by the client in the Studio.
   Seeded by scripts/seed-legal-documents.mjs. */

/** One row of a 事業者情報 / お問い合わせ窓口 table. */
export interface DefinitionRow {
  label: string
  value: string
}

export interface LegalDocument {
  slug: string
  title: string
  /** Footer link text; falls back to the title when the client leaves it blank. */
  navLabel?: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[]
  established?: string
  operator?: string
  copyright?: string
}

const LEGAL_FIELDS = `
  slug,
  title,
  navLabel,
  description,
  body,
  established,
  operator,
  copyright
`

export async function getLegalDocument(slug: string): Promise<LegalDocument | null> {
  try {
    const result = await getSanityClient().fetch<LegalDocument | null>(
      `*[_type == "legalDocument" && slug == $slug][0] { ${LEGAL_FIELDS} }`,
      { slug }
    )
    return result ?? null
  } catch {
    return null
  }
}

/** Just the slug and label, for the footer's legal row. */
export async function getLegalLinks(): Promise<{ slug: string; label: string }[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "legalDocument" && defined(slug)] {
        slug,
        "label": coalesce(navLabel, title)
      }`
    )
  } catch {
    return []
  }
}
