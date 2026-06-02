import type { Metadata } from 'next'
import SeriesPage from '@/components/product/SeriesPage'

export const metadata: Metadata = { title: 'Smart Toilet' }

export default function SmartToiletPage() {
  return <SeriesPage series="smart-toilet" />
}
