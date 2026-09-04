import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { getLegalDocument } from '@/lib/sanity'

const SLUG = 'terms-of-use'

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument(SLUG)
  return {
    title: doc?.navLabel ?? doc?.title ?? 'ご利用条件',
    description: doc?.description,
  }
}

export default async function TermsOfUsePage() {
  const doc = await getLegalDocument(SLUG)
  if (!doc) notFound()

  return <LegalDocumentView doc={doc} />
}
