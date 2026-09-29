/**
 * Puts serials that were registered before they were ever imported into the
 * library, bound to the registration that uses them.
 *
 * Registration accepts a serial the library has not heard of (it is flagged,
 * never refused), and binding only claims a row that already exists — so a
 * product registered early has a warranty but no library row, and the Serial
 * Numbers page cannot show who holds it. Imports now bind as they go; this
 * catches the registrations made before that.
 *
 * Each row is written BOUND, with the registration's model, the product's
 * series from Sanity, and batch "registered-before-import" so they can be found.
 *
 * Usage: npx tsx scripts/backfill-registered-serials.mts           (dry run)
 *        npx tsx scripts/backfill-registered-serials.mts --apply
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match && process.env[match[1]] === undefined) {
    process.env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1')
  }
}

const { db } = await import('../src/lib/db')
const { productRegistration, serialNumberEntry, serialAuditLog } = await import('../src/lib/db/schema')
const { eq, isNull } = await import('drizzle-orm')

const BATCH = 'registered-before-import'
const apply = process.argv.includes('--apply')

const missing = await db
  .select({
    id: productRegistration.id,
    userId: productRegistration.userId,
    modelId: productRegistration.modelId,
    modelName: productRegistration.modelName,
    serialNumber: productRegistration.serialNumber,
    submittedAt: productRegistration.submittedAt,
  })
  .from(productRegistration)
  .leftJoin(serialNumberEntry, eq(serialNumberEntry.serialNumber, productRegistration.serialNumber))
  .where(isNull(serialNumberEntry.id))

// The product document knows its series; the registration only has its id.
async function seriesOf(modelIds: string[]): Promise<Record<string, string>> {
  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const query = encodeURIComponent(`*[_id in $ids]{_id, series}`)
  const ids = encodeURIComponent(JSON.stringify(modelIds))
  const res = await fetch(
    `https://${project}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}&$ids=${ids}`,
    { headers: { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` } }
  )
  const { result } = (await res.json()) as { result: { _id: string; series?: string }[] }
  return Object.fromEntries(result.filter((p) => p.series).map((p) => [p._id, p.series!]))
}

const series = missing.length ? await seriesOf([...new Set(missing.map((r) => r.modelId))]) : {}

for (const reg of missing) {
  console.log(`${apply ? '+' : '·'} ${reg.serialNumber.padEnd(24)} ${reg.modelName}  (${series[reg.modelId] ?? 'no series'})`)
  if (!apply) continue

  const [row] = await db
    .insert(serialNumberEntry)
    .values({
      serialNumber: reg.serialNumber,
      series: series[reg.modelId] ?? null,
      modelName: reg.modelName,
      batch: BATCH,
      status: 'BOUND',
      note: '製品登録が台帳への取り込みより先に行われたため追加',
      registrationId: reg.id,
      boundUserId: reg.userId,
      boundAt: reg.submittedAt,
      createdBy: 'system',
    })
    .onConflictDoNothing({ target: serialNumberEntry.serialNumber })
    .returning({ id: serialNumberEntry.id })

  if (row) {
    await db.insert(serialAuditLog).values({
      serialId: row.id,
      serialNumber: reg.serialNumber,
      action: 'BIND',
      operator: 'system',
      details: `Added from registration ${reg.id}, which predates the serial's import`,
      changes: { status: { from: null, to: 'BOUND' }, registrationId: { from: null, to: reg.id } },
    })
  }
}

console.log(
  missing.length
    ? `\n${missing.length} registered serial${missing.length === 1 ? '' : 's'} not in the library.` +
        (apply ? ' Added.' : ' Dry run — pass --apply to add them.')
    : 'Every registered serial is already in the library.'
)
process.exit(0)
