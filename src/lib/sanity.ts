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
    // Return empty array during build / when Sanity is not configured
    return []
  }
}
