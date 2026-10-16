/**
 * Turns the single 保証期間:2年 in 製品保証期間 (afterSalesPage) into a
 * 製品別保証期間 block — one row per product series, since each series has its
 * own period. The two paragraphs that held the スマートトイレ wording are
 * replaced by the block, their text kept as that row's note.
 *
 * Only スマートトイレ (2年) is known; the other series are listed with お問い合わせください as their period until staff
 * enter the real one under アフターサービス in the Studio.
 *
 * Re-runnable: a section that already has the block is left alone.
 *
 * Usage: node scripts/add-series-warranty.mjs [--apply]
 */
import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')])
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const apply = process.argv.includes('--apply')
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const text = (block) => (block.children ?? []).map((c) => c.text ?? '').join('')

const ROWS = [
  {
    series: 'スマートトイレ',
    period: '2年',
    note: '製品保証の対象は、製品本体および付属部品です。フィルター、発泡剤、電池などの消耗品は保証対象外となります。',
  },
  { series: 'シャワーセット', period: 'お問い合わせください' },
  { series: '水栓金具', period: 'お問い合わせください' },
  { series: '洗面化粧台', period: 'お問い合わせください' },
]

for (const id of ['afterSalesPage', 'drafts.afterSalesPage']) {
  const doc = await client.getDocument(id)
  if (!doc) continue

  const sections = doc.guideSections ?? []
  const index = sections.findIndex((s) => (s.body ?? []).some((b) => b._type === 'block' && text(b).includes('保証期間:2年')))
  if (sections.some((s) => (s.body ?? []).some((b) => b._type === 'seriesWarranty'))) {
    console.log(`${id}: already has 製品別保証期間 — left alone`)
    continue
  }
  if (index < 0) {
    console.log(`${id}: no 保証期間:2年 paragraph found — left alone`)
    continue
  }

  const body = sections[index].body
  // The scope paragraph and the 消耗品 / 保証期間 paragraph after it.
  const last = body.findIndex((b) => b._type === 'block' && text(b).includes('保証期間:2年'))
  const first = last > 0 && text(body[last - 1]).startsWith('製品保証範囲') ? last - 1 : last
  const block = {
    _key: key(),
    _type: 'seriesWarranty',
    rows: ROWS.map((row) => ({ _key: key(), _type: 'seriesWarrantyRow', ...row })),
  }
  const next = [...body.slice(0, first), block, ...body.slice(last + 1)]

  console.log(`${id}: section「${sections[index].title}」— replacing:`)
  for (const b of body.slice(first, last + 1)) console.log(`   - ${text(b).replace(/\n/g, ' / ')}`)
  console.log(`   + 製品別保証期間: ${ROWS.map((r) => `${r.series} ${r.period || '（未入力）'}`).join('、')}`)

  if (apply) {
    await client.patch(id).set({ [`guideSections[_key=="${sections[index]._key}"].body`]: next }).commit()
    console.log('   applied')
  }
}

if (!apply) console.log('\nDry run — pass --apply to write.')
