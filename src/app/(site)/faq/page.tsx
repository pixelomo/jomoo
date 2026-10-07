import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FaqList from '@/components/faq/FaqList'
import { getFaqPage } from '@/lib/sanity'
import { isHiddenRoute } from '@/components/layout/siteLinks'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFaqPage()
  return pageMetadata({ title: data?.title || 'よくあるご質問', description: data?.description, path: '/faq' })
}

export default async function FaqPage() {
  // Hidden for now — see HIDDEN_ROUTES.
  if (isHiddenRoute('/faq')) notFound()
  const data = await getFaqPage()
  if (!data) notFound()

  return <FaqList data={data} />
}
