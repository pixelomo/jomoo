import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Faucets & Fixtures' }

export default async function FaucetsPage() {
  const t = await getTranslations('home')
  return <SeriesPage series="faucets" title={t('faucetsName')} description={t('faucetsDesc')} />
}
