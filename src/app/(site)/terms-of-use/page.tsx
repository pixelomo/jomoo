import type { Metadata } from 'next'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { TERMS_OF_USE } from '@/lib/legal/documents'

export const metadata: Metadata = {
  title: 'ご利用条件',
  description: TERMS_OF_USE.description,
}

export default function TermsOfUsePage() {
  return <LegalDocumentView doc={TERMS_OF_USE} />
}
