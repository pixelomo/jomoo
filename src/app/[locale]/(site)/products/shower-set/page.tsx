import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Shower Set' }

export default async function ShowerSetPage() {
  const t = await getTranslations('home')
  return <SeriesPage series="shower-set" title={t('showerSetName')} description={t('showerSetDesc')} />
}
