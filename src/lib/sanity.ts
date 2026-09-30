import { cache } from 'react'
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
  // Either a bare asset reference or an image field holding one.
  const ref: string = source?._ref ?? source?.asset?._ref ?? ''
  // GIF refs end with '-gif'. Converting to WebP strips the animation, and a
  // width wider than the file upscales every frame, so a GIF is served as is.
  // An SVG is served as is too: rasterising a vector logo only loses it.
  if (ref.endsWith('-gif') || ref.endsWith('-svg')) return urlFor(source).url()
  return urlFor(source).width(width).format('webp').quality(quality).url()
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
  /** Bold line above the description, as on the homepage lineup cards. */
  tagline?: string
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
  card { image, hoverImage, tagline, description },
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
        card { image, hoverImage, tagline, description }
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

/* ── Page singletons ─────────────────────────────────────────
   会社情報, デザイナー, グローバルプロジェクト, ショールーム, 採用情報,
   よくあるご質問 and アフターサービス, one document each, stored
   under their type name as the id. Seeded by scripts/seed-cms-pages.mjs.

   Multi-line copy is one string, split on \n where it is drawn. */

/** Multi-line copy from the Studio, one entry per line. */
export function lines(text?: string): string[] {
  return text ? text.split('\n').map((line) => line.trim()).filter(Boolean) : []
}

/** An image field, with the file's pixel size read off the asset. */
export interface SizedImage {
  asset?: AssetRef
  alt?: string
  width?: number
  height?: number
}

const SIZED_IMAGE = `{
  asset, alt, hotspot, crop,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`

async function getSingleton<T>(type: string, projection: string): Promise<T | null> {
  try {
    const result = await getSanityClient().fetch<T | null>(
      `*[_id == $type][0] { ${projection} }`,
      { type }
    )
    return result ?? null
  } catch {
    return null
  }
}

export interface CompanyEra {
  _key: string
  from: string
  to?: string
  tint?: 'none' | 'top' | 'bottom'
  eyebrow?: string
  subtitle?: string
  images?: Array<SizedImage & { _key: string }>
  entries?: Array<{ _key: string; year: string; text?: string }>
}

export interface CompanyBrand {
  _key: string
  name: string
  photo?: { asset?: AssetRef }
  logo?: { asset?: AssetRef }
  logoHeight?: number
  logoAlt?: string
  copy?: string
}

export interface CompanyStat {
  _key: string
  label: string
  value: number
  suffix?: string
  icon?: { asset?: AssetRef }
}

export interface CompanyPageData {
  description?: string
  heroTitle?: string
  heroVideoUrl?: string
  heroPoster?: { asset?: AssetRef }
  about?: { eyebrow?: string; title?: string; paragraphs?: string[] }
  historyEyebrow?: string
  historyTitle?: string
  eras?: CompanyEra[]
  brandsEyebrow?: string
  brandsTitle?: string
  brandsIntro?: string
  brands?: CompanyBrand[]
  globalEyebrow?: string
  globalTitle?: string
  globalIntro?: string
  stats?: CompanyStat[]
}

export const getCompanyPage = cache(() =>
  getSingleton<CompanyPageData>(
    'companyPage',
    `
    description,
    heroTitle,
    "heroVideoUrl": heroVideo.asset->url,
    heroPoster,
    about { eyebrow, title, paragraphs },
    historyEyebrow, historyTitle,
    eras[] {
      _key, from, to, tint, eyebrow, subtitle,
      images[] { _key, ...${SIZED_IMAGE} },
      entries[] { _key, year, text }
    },
    brandsEyebrow, brandsTitle, brandsIntro,
    brands[] { _key, name, photo, logo, logoHeight, logoAlt, copy },
    globalEyebrow, globalTitle, globalIntro,
    stats[] { _key, label, value, suffix, icon }
  `
  )
)

export interface Designer {
  _key: string
  name: string
  watermark?: string
  role?: string
  photo?: { asset?: AssetRef }
  body?: string
}

export interface DesignerPageData {
  description?: string
  heroImage?: { asset?: AssetRef }
  heroEyebrow?: string
  heroTitle?: string
  intro?: string
  designers?: Designer[]
  awardsEyebrow?: string
  awardsTitle?: string
  awards?: Array<{ _key: string; name?: string; logo?: { asset?: AssetRef } }>
}

export const getDesignerPage = cache(() =>
  getSingleton<DesignerPageData>(
    'designerPage',
    `
    description,
    heroImage, heroEyebrow, heroTitle, intro,
    designers[] { _key, name, watermark, role, photo, body },
    awardsEyebrow, awardsTitle,
    awards[] { _key, name, logo }
  `
  )
)

export interface GlobalProject {
  _key: string
  title: string
  image?: { asset?: AssetRef }
  description?: string
  country?: string
  category?: string
}

export interface GlobalProjectsPageData {
  description?: string
  heroImage?: { asset?: AssetRef }
  heroEyebrow?: string
  heroTitle?: string
  intro?: string
  countries?: string[]
  categories?: string[]
  projects?: GlobalProject[]
}

export const getGlobalProjectsPage = cache(() =>
  getSingleton<GlobalProjectsPageData>(
    'globalProjectsPage',
    `
    description,
    heroImage, heroEyebrow, heroTitle, intro,
    countries, categories,
    projects[] { _key, title, image, description, country, category }
  `
  )
)

export interface ShowroomPageData {
  description?: string
  heroImage?: { asset?: AssetRef }
  heroEyebrow?: string
  heroTitle?: string
  infoTitle?: string
  rows?: Array<{ _key: string; label: string; value?: string }>
  mapQuery?: string
  ctaLabel?: string
}

export const getShowroomPage = cache(() =>
  getSingleton<ShowroomPageData>(
    'showroomPage',
    `description, heroImage, heroEyebrow, heroTitle, infoTitle,
     rows[] { _key, label, value }, mapQuery, ctaLabel`
  )
)

export interface CareersPageData {
  description?: string
  heroImage?: { asset?: AssetRef }
  heroEyebrow?: string
  heroTitle?: string
  intro?: string
  bands?: Array<{ _key: string; title: string; body?: string; photo?: { asset?: AssetRef }; alt?: string }>
}

export const getCareersPage = cache(() =>
  getSingleton<CareersPageData>(
    'careersPage',
    `description, heroImage, heroEyebrow, heroTitle, intro,
     bands[] { _key, title, body, photo, alt }`
  )
)

export interface FaqPageData {
  description?: string
  eyebrow?: string
  title?: string
  lead?: string
  categories?: Array<{
    _key: string
    label: string
    anchor: string
    /** Each answer's paragraphs are its lines. */
    items?: Array<{ _key: string; q: string; a?: string }>
  }>
}

export const getFaqPage = cache(() =>
  getSingleton<FaqPageData>(
    'faqPage',
    `description, eyebrow, title, lead,
     categories[] { _key, label, anchor, items[] { _key, q, a } }`
  )
)

export interface TermSubClause {
  _key: string
  marker?: string
  text: string
}

export interface TermClause {
  _key: string
  text: string
  subClauses?: TermSubClause[]
  spaced?: boolean
}

export interface AfterSalesPageData {
  description?: string
  title?: string
  lead?: string
  termsTitle?: string
  termGroups?: Array<{ _key: string; clauses?: TermClause[] }>
  termsClosing?: string
}

export const getAfterSalesPage = cache(() =>
  getSingleton<AfterSalesPageData>(
    'afterSalesPage',
    `description, title, lead, termsTitle,
     termGroups[] { _key, clauses[] { _key, text, spaced, subClauses[] { _key, marker, text } } },
     termsClosing`
  )
)

type Img = { asset?: AssetRef }

export interface HomePageData {
  description?: string
  heroProduct?: {
    image?: Img
    eyebrow?: string
    logo?: Img
    logoAlt?: string
    subtitle?: string
    tagline?: string
    awards?: Array<{ _key: string; image?: Img; alt?: string }>
    footnotes?: string
  }
  heroVideo?: { videoUrl?: string; eyebrow?: string; title?: string; tagline?: string }
  heroBrand?: { background?: Img; foreground?: Img; note?: string }
  worldEyebrow?: string
  worldTitle?: string
  worldBody?: string[]
  worldClosing?: string
  worldMain?: Img
  worldForest?: Img
  worldShower?: Img
  worldBathroom?: Img
  expandImage?: Img
  expandAlt?: string
  expandLabel?: string
  spotlightSlides?: Array<{
    _key: string
    label?: string
    title?: string
    body?: string
    media?: 'image' | 'video' | 'turntable'
    image?: Img
    videoUrl?: string
    playLabel?: string
  }>
  lineupEyebrow?: string
  lineupTitle?: string
  lineupSubtitle?: string
  lineupProducts?: Array<{
    _id: string
    slug?: string
    series?: string
    name?: string
    tagline?: string
    heroTitle?: string
    heroEyebrow?: string
    thumbnail?: AssetRef
    card?: ProductCard
  }>
  projectsEyebrow?: string
  projectsTitle?: string
  projectsSubtitle?: string
  projectsCta?: string
  projectSlides?: Array<{ _key: string; image?: Img; title: string; meta?: string }>
  stats?: Array<{ _key: string; label: string; softBreak?: boolean; value: number; suffix?: string; icon?: Img }>
  designEyebrow?: string
  designTitle?: string
  designSubtitle?: string
  designButton?: string
  designLane1?: Array<{ _key: string; image?: Img; onBackdrop?: boolean }>
  designLane2?: Array<{ _key: string; image?: Img; onBackdrop?: boolean }>
  /** The award marks, read from the デザイナー page so there is one list. */
  awardLogos?: Array<{ _key: string; name?: string; logo?: Img }>
}

export const getHomePage = cache(() =>
  getSingleton<HomePageData>(
    'homePage',
    `
    ...,
    heroVideo { eyebrow, title, tagline, "videoUrl": video.asset->url },
    spotlightSlides[] { _key, label, title, body, media, image, playLabel, "videoUrl": video.asset->url },
    lineupProducts[]-> {
      _id, "slug": slug.current, series, name, tagline,
      "heroTitle": hero.title, "heroEyebrow": hero.eyebrow,
      "thumbnail": images[0].asset,
      card { image, hoverImage, tagline, description }
    },
    "awardLogos": *[_id == "designerPage"][0].awards[] { _key, name, logo }
  `
  )
)

export interface SiteCtaCard {
  image?: Img
  eyebrow?: string
  title?: string
  button?: string
}

export interface SiteCtaData {
  catalog?: SiteCtaCard & { pdfUrl?: string }
  contact?: SiteCtaCard
}

export const getSiteCta = cache(() =>
  getSingleton<SiteCtaData>(
    'siteCta',
    `catalog { image, eyebrow, title, button, "pdfUrl": pdf.asset->url },
     contact { image, eyebrow, title, button }`
  )
)
