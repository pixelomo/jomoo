import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { getLegalDocument } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

const SLUG = 'privacy-policy'

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument(SLUG)
  return pageMetadata({
    title: doc?.navLabel ?? doc?.title ?? 'プライバシーポリシー',
    description: doc?.description,
    path: `/${SLUG}`,
  })
}

export default async function PrivacyPolicyPage() {
  const doc = await getLegalDocument(SLUG)
  if (!doc) notFound()

  return <LegalDocumentView doc={doc} />
}
