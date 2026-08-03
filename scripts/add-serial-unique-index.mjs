/**
 * Adds the unique index that actually guarantees one registration per serial.
 *
 * The check in src/lib/serialRegistry.ts gives the member a readable message,
 * but two submissions racing each other can both pass it and both insert. Only
 * the database can rule that out.
 *
 * Refuses to run while duplicates exist, since creating the index would fail
 * halfway and leave nothing useful behind. Run it, resolve anything it reports,
 * run it again.
 *
 * Usage: node scripts/add-serial-unique-index.mjs          (report only)
 *        node scripts/add-serial-unique-index.mjs --apply  (create the index)
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const APPLY = process.argv.includes('--apply')
const INDEX = 'idx_reg_serial_unique'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

const [{ exists }] = await sql`
  select count(*)::int > 0 as exists
  from pg_indexes
  where tablename = 'product_registrations' and indexname = ${INDEX}`

if (exists) {
  console.log(`${INDEX} already exists — nothing to do.`)
  await sql.end()
  process.exit(0)
}

const duplicates = await sql`
  select serial_number,
         count(*)::int as copies,
         array_agg(id order by submitted_at) as ids,
         min(submitted_at) as first_seen,
         max(submitted_at) as last_seen
  from product_registrations
  group by serial_number
  having count(*) > 1
  order by count(*) desc`

if (duplicates.length) {
  console.log(`Cannot create ${INDEX} — ${duplicates.length} serial(s) are registered more than once:\n`)
  for (const d of duplicates) {
    console.log(`  ${d.serial_number}  ${d.copies} rows`)
    d.ids.forEach((id, i) => console.log(`     ${i === 0 ? 'keep  ' : 'remove'} ${id}`))
    console.log(`     first ${d.first_seen.toISOString()}  last ${d.last_seen.toISOString()}`)
  }
  console.log('\nResolve these, then re-run. Nothing has been changed.')
  await sql.end()
  process.exit(1)
}

if (!APPLY) {
  console.log('No duplicates. Re-run with --apply to create the index.')
  await sql.end()
  process.exit(0)
}

await sql.unsafe(
  `create unique index ${INDEX} on product_registrations (serial_number)`
)
console.log(`${INDEX} created — the database now rejects a second registration of the same serial.`)
await sql.end()
