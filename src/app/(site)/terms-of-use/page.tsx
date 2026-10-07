import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { getLegalDocument } from '@/lib/sanity'
import { pageMetadata } from '@/lib/seo'

const SLUG = 'terms-of-use'

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument(SLUG)
  return pageMetadata({
    title: doc?.navLabel ?? doc?.title ?? 'ご利用条件',
    description: doc?.description,
    path: `/${SLUG}`,
  })
}

export default async function TermsOfUsePage() {
  const doc = await getLegalDocument(SLUG)
  if (!doc) notFound()

  return <LegalDocumentView doc={doc} />
}
