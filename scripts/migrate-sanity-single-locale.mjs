/**
 * One-shot migration: flatten the {zhCN, en} localized objects in Sanity down to
 * plain Japanese fields, matching the single-locale schema.
 *
 * Which side holds the Japanese copy differs by document type — product docs were
 * authored with Japanese in `en`, series docs with Japanese in `zhCN` — so the
 * source key is chosen per type rather than globally. Product `name` is the one
 * field that was Japanese in neither, so it is supplied explicitly below.
 *
 * Run:  node scripts/migrate-sanity-single-locale.mjs          (dry run)
 *       node scripts/migrate-sanity-single-locale.mjs --apply  (writes)
 */
import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
})

/** Product names were English on one side and Chinese on the other. */
const PRODUCT_NAME_JA = {
  'product-x40-b': 'X40-B スマートトイレ',
  'product-x40-c': 'X40-C スマートトイレ',
}

/**
 * specTable and specs[].value were never localized fields, so they kept their
 * original Chinese copy and would have surfaced untranslated on a JP-only site.
 * Matched on the exact stored string so re-running is a no-op once fixed.
 */
const CONTENT_FIXES = {
  '棉花白 / Cotton White': 'コットンホワイト',
  '虹吸式 / Siphon Jet': 'サイフォンジェット式',
  '陶瓷 / Vitreous China': '陶器',
  '大冲 4.5 L / 小冲 3 L': '大 4.5 L / 小 3 L',
  '200–300 mm（含移位器）': '200–300 mm（移動アダプター含む）',
  '300–580 mm（需另购 JPP860-SA-IDO）': '300–580 mm（JPP860-SA-IDO を別途購入）',
  '6LR61 电池': '6LR61 乾電池',
}

const fixCopy = (value) => {
  if (typeof value === 'string') return CONTENT_FIXES[value] ?? value
  if (Array.isArray(value)) return value.map(fixCopy)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fixCopy(v)]))
  }
  return value
}

const isLocalized = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('zhCN' in v || 'en' in v)

/** Collapse a {zhCN, en} object to the side that holds Japanese, else the other. */
const pick = (v, key) => (v?.[key] ?? v?.[key === 'en' ? 'zhCN' : 'en'] ?? undefined)

function flatten(value, key) {
  if (Array.isArray(value)) return value.map((v) => flatten(v, key))
  if (isLocalized(value)) return pick(value, key)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, flatten(v, key)]))
  }
  return value
}

const FIELDS = {
  product: ['name', 'tagline', 'description', 'longDescription', 'features', 'specs', 'specTable', 'featureImages', 'featureVideos'],
  productSeries: ['name', 'tagline', 'description'],
}

async function main() {
  const docs = await client.fetch('*[_type in ["product", "productSeries"]]')
  writeFileSync(
    new URL('../.sanity-pre-migration-backup.json', import.meta.url),
    JSON.stringify(docs, null, 2)
  )
  console.log(`backed up ${docs.length} documents to .sanity-pre-migration-backup.json\n`)

  for (const doc of docs) {
    // Japanese lives in `en` for products, `zhCN` for series.
    const source = doc._type === 'product' ? 'en' : 'zhCN'
    const set = {}

    for (const field of FIELDS[doc._type]) {
      if (doc[field] === undefined) continue
      const next = fixCopy(flatten(doc[field], source))
      if (next !== undefined) set[field] = next
    }

    if (doc._type === 'product' && PRODUCT_NAME_JA[doc._id]) {
      set.name = PRODUCT_NAME_JA[doc._id]
    }

    console.log(`${doc._id} (${doc._type}) — ${Object.keys(set).join(', ')}`)
    for (const [k, v] of Object.entries(set)) {
      const preview = typeof v === 'string' ? v : JSON.stringify(v)
      console.log(`    ${k}: ${preview.slice(0, 90)}${preview.length > 90 ? '…' : ''}`)
    }

    if (APPLY) {
      await client.patch(doc._id).set(set).commit()
      console.log('    ✓ written')
    }
  }

  console.log(APPLY ? '\nMigration applied.' : '\nDry run — re-run with --apply to write.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
