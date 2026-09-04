/**
 * Puts the privacy policy and the ご利用条件 into Sanity, so the client can fill
 * in the blanks and keep the wording current without a deploy.
 *
 * The content in scripts/legal-documents.json is the client's own RTFs,
 * Japanese half only, converted to Portable Text — the 【…】 passages they have
 * yet to supply are carried across untouched, for them to replace in the CMS.
 *
 * createIfNotExists, so a re-run never overwrites edits made in the Studio. To
 * push a corrected transcription over the top, pass --replace.
 *
 * Run:  node scripts/seed-legal-documents.mjs            (dry run)
 *       node scripts/seed-legal-documents.mjs --apply    (writes, keeps edits)
 *       node scripts/seed-legal-documents.mjs --apply --replace
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const REPLACE = process.argv.includes('--replace')
const ROOT = new URL('..', import.meta.url)

const env = Object.fromEntries(
  readFileSync(new URL('.env.local', ROOT), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
})

const docs = JSON.parse(readFileSync(new URL('scripts/legal-documents.json', ROOT), 'utf8'))

for (const doc of docs) {
  const blocks = doc.body.filter((b) => b._type === 'block')
  const summary = [
    `${blocks.filter((b) => b.style === 'h2').length} 条`,
    `${blocks.filter((b) => b.listItem === 'number').length} 号`,
    `${doc.body.filter((b) => b._type === 'definitionList').length} 項目一覧`,
  ].join(' / ')

  const existing = await client.fetch('*[_id == $id][0]{_id}', { id: doc._id })

  if (!APPLY) {
    console.log(
      `${existing ? (REPLACE ? 'would replace' : 'exists, would keep') : 'would create'}  ` +
        `${doc._id}  ${doc.title}  (${summary})`
    )
    continue
  }

  if (existing && !REPLACE) {
    console.log(`kept     ${doc._id}  (already in Sanity — pass --replace to overwrite)`)
    continue
  }

  await (REPLACE ? client.createOrReplace(doc) : client.createIfNotExists(doc))
  console.log(`${REPLACE ? 'replaced' : 'created '} ${doc._id}  ${doc.title}  (${summary})`)
}
