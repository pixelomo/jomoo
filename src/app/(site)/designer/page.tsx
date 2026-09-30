import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesignerPage from '@/components/designer/DesignerPage'
import { getDesignerPage } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDesignerPage()
  return { title: 'デザイナー', description: data?.description }
}

export default async function Designer() {
  const data = await getDesignerPage()
  if (!data) notFound()

  return <DesignerPage data={data} />
}
