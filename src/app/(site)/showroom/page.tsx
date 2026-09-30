import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShowroomPage from '@/components/showroom/ShowroomPage'
import { getShowroomPage } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShowroomPage()
  return { title: 'ショールーム', description: data?.description }
}

export default async function Showroom() {
  const data = await getShowroomPage()
  if (!data) notFound()

  return <ShowroomPage data={data} />
}
