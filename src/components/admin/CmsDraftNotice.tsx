import type { CreatedDraft } from '@/lib/catalogDrafts'

/**
 * Shown after an add or import that started CMS pages. The drafts are invisible
 * on the site until they are published, and the one thing staff must not leave
 * thinking is that the new series is already live — so this says so plainly
 * and links straight to each document in the Studio.
 */
export default function CmsDraftNotice({ drafts }: { drafts: CreatedDraft[] }) {
  if (!drafts.length) return null
  const series = drafts.filter((d) => d.kind === 'series')
  const products = drafts.filter((d) => d.kind === 'product')

  return (
    <div style={box}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#8d6e00' }}>
        CMSでの公開が必要です / Publish in the CMS
      </p>
      <p style={{ margin: '0 0 10px', lineHeight: 1.6 }}>
        新しいシリーズページと製品は<strong>下書き</strong>として作成されました。CMSで画像や文章を入力して
        「公開」するまで、サイトには新しいシリーズページもメニューのリンクも表示されません。製品も公開されるまで製品登録フォームに表示されません。
      </p>
      <p style={{ margin: '0 0 10px', lineHeight: 1.6, color: 'var(--ink-3)' }}>
        The new series page and products were created as drafts. The site will not show the series page, its menu
        link or the products in the registration form until each one is published in the CMS.
      </p>

      {series.length > 0 && <DraftList title="シリーズページ / Series pages" items={series} />}
      {products.length > 0 && <DraftList title="製品 / Products" items={products} />}
    </div>
  )
}

function DraftList({ title, items }: { title: string; items: CreatedDraft[] }) {
  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</p>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
        {items.map((d) => (
          <li key={d.id}>
            {d.name}{' '}
            <a href={d.studioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>
              CMSで開いて公開する ↗
            </a>
            {!d.created && <span style={{ color: 'var(--ink-3)' }}>（作成済み）</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

const box: React.CSSProperties = {
  marginTop: 16,
  padding: '14px 16px',
  border: '1px solid #ffe082',
  borderRadius: 8,
  background: '#fffbeb',
  fontSize: 13,
  color: 'var(--ink-2)',
}
