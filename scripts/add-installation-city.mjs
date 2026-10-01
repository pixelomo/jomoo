/**
 * Adds 市区町村 to product registrations.
 *
 * The registration form used to take everything after the prefecture as one
 * free-text line, so the city in the serial export had to be guessed from the
 * front of it. The form now asks for it on its own; this is the column it goes
 * in. Nullable, so a registration made before the field existed stays valid —
 * the export falls back to reading the old line for those.
 *
 * Additive and re-runnable. Usage: node scripts/add-installation-city.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

await sql`alter table product_registrations add column if not exists installation_address_city text`

console.table(
  await sql`
    select column_name, data_type, is_nullable from information_schema.columns
    where table_name = 'product_registrations' and column_name like 'installation_address%'
    order by column_name`
)

await sql.end()
