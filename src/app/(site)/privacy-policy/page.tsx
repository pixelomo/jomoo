import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { getLegalDocument } from '@/lib/sanity'

const SLUG = 'privacy-policy'

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument(SLUG)
  return {
    title: doc?.navLabel ?? doc?.title ?? 'プライバシーポリシー',
    description: doc?.description,
  }
}

export default async function PrivacyPolicyPage() {
  const doc = await getLegalDocument(SLUG)
  if (!doc) notFound()

  return <LegalDocumentView doc={doc} />
}
