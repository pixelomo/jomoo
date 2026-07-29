import type { Metadata } from 'next'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Shower Set' }

export default function ShowerSetPage() {
  return <SeriesPage series="shower-set" />
}
