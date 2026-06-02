import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Smart Toilet' }

export default async function SmartToiletPage() {
  const t = await getTranslations('home')
  return <SeriesPage series="smart-toilet" title={t('smartToiletName')} description={t('smartToiletDesc')} />
}
