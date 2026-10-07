import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CareersPage from '@/components/careers/CareersPage'
import { getCareersPage } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCareersPage()
  return pageMetadata({ title: '採用情報', description: data?.description, path: '/careers' })
}

export default async function Careers() {
  const data = await getCareersPage()
  if (!data) notFound()

  return <CareersPage data={data} />
}
