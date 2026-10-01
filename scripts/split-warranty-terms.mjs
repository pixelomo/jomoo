/**
 * Splits the 無料修理規定 on afterSalesPage into its four titled sections —
 * 無料修理について, 保証期間について, 保証の適用範囲, 免責事項 — which the
 * /after-sales page and the warranty certificate both show as buttons above the
 * terms. Clause wording is carried over untouched (keys included, so Studio
 * history follows each clause); 保証期間について gains the one clause stating
 * the 2-year / 5-year rule that registration now applies.
 *
 * Re-runnable: a document already in sections is left alone.
 *
 * Usage: node scripts/split-warranty-terms.mjs [--apply]
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

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

export const PERIOD_CLAUSE =
  '本製品の保証期間は、引き渡し/購入日から2年間です。引き渡し/購入日から3か月以内にJOMOO倶楽部会員として製品登録を行った場合は、3年間の延長保証が加わり、保証期間は5年間となります。3か月を過ぎて製品登録を行った場合は、2年間の保証となります。'

/** The same split, applied to the seed file's plain clauses as to the live document. */
export function split(groups, withKeys) {
  const all = groups.flatMap((g) => g.clauses ?? [])
  const find = (start) => {
    const c = all.find((c) => c.text.startsWith(start))
    if (!c) throw new Error(`clause not found: ${start}`)
    return c
  }
  const k = (o) => (withKeys ? { _key: key(), ...o } : o)
  const group = (title, clauses) => k({ ...(withKeys && { _type: 'termGroup' }), title, clauses })

  return [
    group('無料修理について', [find('取扱説明書に従った'), find('無料修理をご希望の場合')]),
    group('保証期間について', [
      k({ ...(withKeys && { _type: 'termClause' }), text: PERIOD_CLAUSE }),
      find('保証期間は、本保証書に記載の'),
    ]),
    group('保証の適用範囲', [find('本保証書は日本国内でのみ有効です')]),
    group('免責事項', [find('保証期間内であっても、以下の場合')]),
  ]
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const doc = await client.getDocument('afterSalesPage')
  if (doc.termGroups?.every((g) => g.title)) {
    console.log('afterSalesPage is already in sections — nothing to do.')
  } else {
    const termGroups = split(doc.termGroups, true)
    for (const g of termGroups) console.log(`${g.title}: ${g.clauses.length} clause(s)`)
    if (process.argv.includes('--apply')) {
      await client.patch('afterSalesPage').set({ termGroups }).commit()
      console.log('Written.')
    } else {
      console.log('Dry run — pass --apply to write.')
    }
  }
}
