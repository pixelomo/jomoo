/**
 * Adds the パートナー application columns to "user".
 *
 * Additive and re-runnable, like add-dealer-branches.mjs, so it can be pointed
 * at production without reading a drizzle-kit plan first.
 *
 * Usage: node scripts/add-partner-members.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

await sql`alter table "user" add column if not exists partner_status text`
await sql`alter table "user" add column if not exists partner_reviewed_at timestamp`
await sql`alter table "user" add column if not exists partner_reviewed_by text`
await sql`create index if not exists idx_user_partner_status on "user" (partner_status)`

console.log('partner columns ready')
await sql.end()
