import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Washstand' }

export default async function WashstandPage() {
  const t = await getTranslations('home')
  return <SeriesPage series="washstand" title={t('washstandName')} description={t('washstandDesc')} />
}
