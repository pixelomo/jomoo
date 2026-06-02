import type { Metadata } from 'next'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Faucets & Fixtures' }

export default function FaucetsPage() {
  return <SeriesPage series="faucets" />
}
