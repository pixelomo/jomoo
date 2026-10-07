import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductSlugs, getSeriesPage } from '@/lib/sanity'
import { pageMetadata, sanityShareImage } from '@/lib/seo'
import SeriesPage from '@/components/product/SeriesPage'

/**
 * Every series lineup, from its productSeries document. One route rather than a
 * folder per series, so a series added through the serial import has a page as
 * soon as it is published in the Studio — and none before: drafts are not
 * readable by the site, so an unpublished series 404s here.
 */
type Params = Promise<{ series: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const seriesId = (await params).series
  const [series, slugs] = await Promise.all([getSeriesPage(seriesId), getProductSlugs(seriesId)])
  return {
    ...pageMetadata({
      title: series?.name ?? undefined,
      description: series?.description ?? series?.tagline ?? undefined,
      path: `/products/${seriesId}`,
      images: sanityShareImage(series?.productDefaults?.heroImage, series?.name ?? 'JOMOO'),
    }),
    // Kept out of search results until its first product is published.
    ...(slugs.length === 0 && { robots: { index: false, follow: true } }),
  }
}

export default async function ProductSeriesPage({ params }: { params: Params }) {
  const { series } = await params
  if (!(await getSeriesPage(series))) notFound()

  return <SeriesPage series={series} />
}
