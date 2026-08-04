import Link from 'next/link'
import './member-portal.css'

interface Warranty {
  registrationId: string
  expiryDate: string
  modelName: string
  serialNumber: string
}

/**
 * ご契約情報 — the warranties a member currently holds. Read-only: the card
 * itself lives at /warranty/[id].
 */
export default function WarrantySummary({ warranties }: { warranties: Warranty[] }) {
  const heading = `ご契約一覧（${warranties.length}件）`

  if (warranties.length === 0) {
    return (
      <section className="member-card">
        <h2 className="member-card__title">{heading}</h2>
        <p className="member-card__body">現在ご契約中の保証はありません。</p>
        <p className="member-card__body">
          製品を登録いただくと、保証内容をこちらでご確認いただけます。
        </p>
        <div className="member-card__actions">
          <Link className="member-btn" href="/register">
            製品を登録
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="member-card">
      <h2 className="member-card__title">{heading}</h2>
      <div className="member-panel__legacy">
        {warranties.map((w) => (
          <div key={w.registrationId} className="member-card__row">
            <div className="member-card__copy">
              <p className="member-card__body">
                {w.modelName}
                <br />
                製造番号：{w.serialNumber}
                <br />
                保証期限：
                {new Date(w.expiryDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Link className="member-btn" href={`/warranty/${w.registrationId}`}>
              電子保証カードを見る
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
