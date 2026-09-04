import type { Metadata } from 'next'
import LegalDocumentView from '@/components/legal/LegalDocumentView'
import { PRIVACY_POLICY } from '@/lib/legal/documents'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: PRIVACY_POLICY.description,
}

export default function PrivacyPolicyPage() {
  return <LegalDocumentView doc={PRIVACY_POLICY} />
}
