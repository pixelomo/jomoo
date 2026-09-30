import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FaqList from '@/components/faq/FaqList'
import { getFaqPage } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFaqPage()
  return { title: data?.title || 'よくあるご質問', description: data?.description }
}

export default async function FaqPage() {
  const data = await getFaqPage()
  if (!data) notFound()

  return <FaqList data={data} />
}
