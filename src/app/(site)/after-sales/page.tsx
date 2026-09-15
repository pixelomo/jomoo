import type { Metadata } from 'next'
import RepairTerms from '@/components/warranty/RepairTerms'
import '@/components/warranty/after-sales.css'

export const metadata: Metadata = {
  title: 'アフターサービス',
  description:
    'JOMOO製品の無料修理規定（保証規定）。保証期間、無料修理のご依頼方法、修理費用を申し受ける場合（免責事項）についてご案内します。',
}

export default function AfterSalesPage() {
  return (
    <main className="flex-1 after-sales">
      <div className="after-sales__intro">
        <h1 className="after-sales__title">アフターサービス</h1>
        <p className="after-sales__lead">
          JOMOO製品の無料修理規定（保証規定）について
          <br />
          説明しておりますので、下記内容をご覧ください。
        </p>
      </div>

      <RepairTerms />
    </main>
  )
}
