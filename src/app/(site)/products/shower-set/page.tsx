import type { Metadata } from 'next'
import { getSeriesPage } from '@/lib/sanity'
import SeriesPage from '@/components/product/SeriesPage'

const SERIES = 'shower-set'

export async function generateMetadata(): Promise<Metadata> {
  const series = await getSeriesPage(SERIES)
  return {
    title: series?.name ?? undefined,
    description: series?.description ?? series?.tagline ?? undefined,
  }
}

export default function ShowerSetSeriesPage() {
  return <SeriesPage series={SERIES} />
}
