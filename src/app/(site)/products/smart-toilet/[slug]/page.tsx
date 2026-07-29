import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductDetail, getProductSlugs, type ProductDetail } from '@/lib/sanity'
import ProductDetailTemplate from '@/components/product/ProductDetailTemplate'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const slugs = await getProductSlugs('smart-toilet')
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductDetail('smart-toilet', slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.tagline,
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const t = await getTranslations('home')

  const product: ProductDetail | null = await getProductDetail('smart-toilet', slug)
  if (!product) notFound()

  return (
    <ProductDetailTemplate
      product={product}
      seriesLabel={t('smartToiletName')}
      seriesHref="/products/smart-toilet"
    />
  )
}
