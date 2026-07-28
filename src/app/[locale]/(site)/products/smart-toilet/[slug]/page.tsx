import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductDetail, getProductSlugs, type ProductDetail } from '@/lib/sanity'
import ProductDetailTemplate from '@/components/product/ProductDetailTemplate'

type Params = Promise<{ locale: string; slug: string }>

export async function generateStaticParams() {
  const slugs = await getProductSlugs('smart-toilet')
  const locales = ['zh-CN', 'en']
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductDetail('smart-toilet', slug)
  if (!product) return {}
  const name = locale === 'zh-CN' ? product.name.zhCN : product.name.en
  return {
    title: name,
    description: locale === 'zh-CN' ? product.tagline?.zhCN : product.tagline?.en,
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  const t = await getTranslations('home')

  const product: ProductDetail | null = await getProductDetail('smart-toilet', slug)
  if (!product) notFound()

  return (
    <ProductDetailTemplate
      product={product}
      locale={locale}
      seriesLabel={t('smartToiletName')}
      seriesHref="/products/smart-toilet"
    />
  )
}
