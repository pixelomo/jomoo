import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductDetail } from '@/lib/sanity'
import { pageMetadata, sanityShareImage } from '@/lib/seo'
import ProductDetailTemplate from '@/components/product/ProductDetailTemplate'

/** Rendered on request, so a product published in the Studio is live at once. */
type Params = Promise<{ series: string; slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { series, slug } = await params
  const product = await getProductDetail(series, slug)
  if (!product) return {}
  return pageMetadata({
    title: product.name,
    description: product.card?.description || product.tagline,
    path: `/products/${series}/${slug}`,
    images: sanityShareImage(product.hero?.image ?? product.card?.image, product.name),
  })
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { series, slug } = await params
  const product = await getProductDetail(series, slug)
  if (!product) notFound()

  return <ProductDetailTemplate product={product} />
}
