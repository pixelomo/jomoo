import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShowroomPage from '@/components/showroom/ShowroomPage'
import { getShowroomPage } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShowroomPage()
  return pageMetadata({ title: 'ショールーム', description: data?.description, path: '/showroom' })
}

export default async function Showroom() {
  const data = await getShowroomPage()
  if (!data) notFound()

  return <ShowroomPage data={data} />
}
