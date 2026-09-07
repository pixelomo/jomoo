import type { Metadata } from 'next'
import CompanyProfilePage from '@/components/company/CompanyProfilePage'

export const metadata: Metadata = {
  title: '会社情報',
  description:
    '1990年設立のJOMOOは、研究開発から製造、販売、アフターサービスまでをワンストップで担うグローバルなスマートバスルームブランドです。20,000名を超えるチームと120カ国の市場ネットワークで、スマートキッチン&バスルーム製品を届けています。',
}

export default function CompanyInformationPage() {
  return <CompanyProfilePage />
}
