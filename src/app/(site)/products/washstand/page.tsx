import type { Metadata } from 'next'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Washstand' }

export default function WashstandPage() {
  return <SeriesPage series="washstand" />
}
