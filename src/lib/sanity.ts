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
function getSanityClient(): SanityClient {
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
export async function getProductModels(): Promise<{ _id: string; name: string; modelCode: string }[]> {
  try {
    return await getSanityClient().fetch(
      `*[_type == "product" && isActive == true && defined(modelCode)] | order(name.zhCN asc) {
        _id,
        "name": coalesce(name.zhCN, name.en, "Unknown"),
        modelCode
      }`
    )
  } catch {
    return []
  }
}

export interface ProductSpec {
  label: { zhCN: string; en: string }
  value: string
}

export interface ProductFeature {
  icon: string
  title: { zhCN: string; en: string }
  description: { zhCN: string; en: string }
}

export interface ProductVideo {
  embedUrl: string
  title: { zhCN: string; en: string }
}

export interface ProductSpecTable {
  dimensions?: string
  material?: string
  power?: string
  drainageMethod?: string
  waterConsumption?: string
  weight?: string
  color?: string
  certification?: string
}

export interface ProductDetail {
  _id: string
  modelCode: string
  series: string
  name: { zhCN: string; en: string }
  slug: { current: string }
  tagline?: { zhCN: string; en: string }
  longDescription?: { zhCN: unknown[]; en: unknown[] }
  features?: ProductFeature[]
  specTable?: ProductSpecTable
  specs?: ProductSpec[]
  images?: Array<{ _key: string; asset: { _ref: string }; alt?: string; caption?: string }>
  featureImages?: Array<{ _key: string; asset: { _ref: string }; caption?: { zhCN: string; en: string } }>
  featureVideos?: ProductVideo[]
}

export async function getProductDetail(series: string, slug: string): Promise<ProductDetail | null> {
  try {
    const result = await getSanityClient().fetch(
      `*[_type == "product" && series == $series && slug.current == $slug][0] {
        _id, modelCode, series,
        name, slug, tagline,
        longDescription,
        features[] { icon, title, description },
        specTable,
        specs[] { label, value },
        images[] { _key, asset, alt, caption },
        featureImages[] { _key, asset, caption },
        featureVideos[] { embedUrl, title }
      }`,
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
