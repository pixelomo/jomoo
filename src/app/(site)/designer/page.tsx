import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesignerPage from '@/components/designer/DesignerPage'
import { getDesignerPage } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDesignerPage()
  return pageMetadata({ title: 'デザイナー', description: data?.description, path: '/designer' })
}

export default async function Designer() {
  const data = await getDesignerPage()
  if (!data) notFound()

  return <DesignerPage data={data} />
}
