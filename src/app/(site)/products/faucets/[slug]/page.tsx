import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductDetail, getProductSlugs } from '@/lib/sanity'
import ProductDetailTemplate from '@/components/product/ProductDetailTemplate'

const SERIES = 'faucets'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const slugs = await getProductSlugs(SERIES)
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductDetail(SERIES, slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.tagline,
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductDetail(SERIES, slug)
  if (!product) notFound()

  return <ProductDetailTemplate product={product} />
}
