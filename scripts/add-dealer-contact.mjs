/**
 * Adds the contact columns to dealer_branches.
 *
 * A branch is what a customer picks from the 販売店 list when they register a
 * product, and until now it held an address but no way to reach anybody. These
 * two columns are what the registration form shows the customer the moment they
 * pick a dealer, and what the portal's dealer list prints.
 *
 * Additive and re-runnable, so it can be pointed at production without reading
 * a `drizzle-kit push` plan first.
 *
 * Usage: node scripts/add-dealer-contact.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

await sql`alter table dealer_branches add column if not exists phone text`
await sql`alter table dealer_branches add column if not exists email text`

console.table(
  await sql`
    select column_name, data_type from information_schema.columns
    where table_name = 'dealer_branches' and column_name in ('phone', 'email')
    order by column_name`
)

await sql.end()
