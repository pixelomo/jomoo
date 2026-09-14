import type { Metadata } from 'next'
import CareersPage from '@/components/careers/CareersPage'

export const metadata: Metadata = {
  title: '採用情報',
  description:
    'JOMOOは、社員一人ひとりの挑戦と成長が会社の未来をつくると信じています。採用理念、働きやすい職場環境、成長を支える制度、社員の健康と福利厚生 — JOMOOで築くキャリアをご紹介します。',
}

export default function Careers() {
  return <CareersPage />
}
