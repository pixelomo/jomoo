/**
 * Puts the ブログ, 会社情報, グローバルプロジェクト and デザイナー content into
 * Sanity. Until this moved to the CMS it was written into the site's source;
 * scripts/cms-pages.json is that content as it stood, one Sanity document each.
 *
 * In the JSON a picture is written { "$image": "/images/…" } and a video
 * { "$file": "/images/…" } — paths under public/. Each is uploaded as a Sanity
 * asset (skipped when an asset with the same content is already there) and
 * swapped for a reference; any other keys beside it, such as alt or caption,
 * are kept on the image.
 *
 * createIfNotExists, so a re-run never overwrites edits made in the Studio. To
 * push the JSON over the top, pass --replace.
 *
 * Run:  node scripts/seed-cms-pages.mjs            (dry run)
 *       node scripts/seed-cms-pages.mjs --apply    (writes, keeps edits)
 *       node scripts/seed-cms-pages.mjs --apply --replace
 */
import { createClient } from '@sanity/client'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

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

const docs = JSON.parse(readFileSync(new URL('scripts/cms-pages.json', ROOT), 'utf8'))

/* ── assets ─────────────────────────────────────────────────── */

const uploaded = new Map()

/** Uploads a file under public/ once, and returns its asset id. Sanity names
 *  assets by the SHA-1 of their bytes, so the hash tells us whether it is
 *  already there without sending 55MB of blog photographs again. */
async function upload(publicPath, kind) {
  if (uploaded.has(publicPath)) return uploaded.get(publicPath)

  const buf = readFileSync(new URL(`public${publicPath}`, ROOT))
  const sha1 = createHash('sha1').update(buf).digest('hex')
  const type = kind === 'image' ? 'sanity.imageAsset' : 'sanity.fileAsset'
  let id = await client.fetch(`*[_type == $type && sha1hash == $sha1][0]._id`, { type, sha1 })

  if (!id) {
    if (!APPLY) {
      id = `(new ${kind}: ${publicPath})`
    } else {
      const asset = await client.assets.upload(kind, buf, { filename: basename(publicPath) })
      id = asset._id
      console.log(`    uploaded ${publicPath}`)
    }
  }

  uploaded.set(publicPath, id)
  return id
}

/** Every array member that is an object needs a _key; the JSON leaves them
 *  out, so they are made from the position — stable across re-runs. */
function key(path) {
  return createHash('sha1').update(path).digest('hex').slice(0, 12)
}

async function resolve(value, path) {
  if (Array.isArray(value)) {
    return Promise.all(
      value.map(async (item, i) => {
        const out = await resolve(item, `${path}[${i}]`)
        return out && typeof out === 'object' && !out._key ? { _key: key(`${path}[${i}]`), ...out } : out
      })
    )
  }
  if (!value || typeof value !== 'object') return value

  const { $image, $file, ...rest } = value
  const out = {}
  for (const [k, v] of Object.entries(rest)) out[k] = await resolve(v, `${path}.${k}`)

  if ($image || $file) {
    const kind = $image ? 'image' : 'file'
    return {
      _type: out._type ?? kind,
      ...out,
      asset: { _type: 'reference', _ref: await upload($image ?? $file, kind) },
    }
  }
  return out
}

/* ── documents ──────────────────────────────────────────────── */

for (const raw of docs) {
  const existing = await client.fetch('*[_id == $id][0]{_id}', { id: raw._id })
  const label = `${raw._id}  ${raw.title ?? ''}`.trim()

  if (existing && !REPLACE) {
    console.log(`kept     ${label}  (already in Sanity — pass --replace to overwrite)`)
    continue
  }

  const doc = await resolve(raw, raw._id)

  if (!APPLY) {
    console.log(`${existing ? 'would replace' : 'would create'}  ${label}`)
    continue
  }

  await (REPLACE ? client.createOrReplace(doc) : client.createIfNotExists(doc))
  console.log(`${REPLACE ? 'replaced' : 'created '} ${label}`)
}

const pending = [...uploaded.values()].filter((id) => id.startsWith('(new'))
if (!APPLY && pending.length) console.log(`\n${pending.length} file(s) would be uploaded.`)
