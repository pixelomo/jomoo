/**
 * Adds the dealer-branch tables and columns.
 *
 * `drizzle-kit push` would do this too, but it diffs the whole schema against
 * a database holding real registrations and can propose destructive statements
 * on the way past. Everything here is additive and re-runnable, so it can be
 * pointed at production without reading a plan first.
 *
 * Usage: node scripts/add-dealer-branches.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

await sql`
  create table if not exists dealer_branches (
    id text primary key,
    name text not null,
    name_kana text,
    postal_code text,
    prefecture text,
    city text,
    street_address text,
    building text,
    match_key text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`
await sql`create unique index if not exists idx_branch_match_key on dealer_branches (match_key)`
await sql`create index if not exists idx_branch_name on dealer_branches (name)`

await sql`alter table "user" add column if not exists member_type text`
await sql`alter table "user" add column if not exists branch_id text`
await sql`alter table product_registrations add column if not exists branch_id text`
await sql`create index if not exists idx_reg_branch_id on product_registrations (branch_id)`

// `add constraint` has no IF NOT EXISTS, so each one is checked first.
for (const [table, name] of [
  ['user', 'user_branch_id_dealer_branches_id_fk'],
  ['product_registrations', 'product_registrations_branch_id_dealer_branches_id_fk'],
]) {
  const [{ exists }] = await sql`
    select count(*)::int > 0 as exists from pg_constraint where conname = ${name}`
  if (exists) {
    console.log(`  = ${name}`)
    continue
  }
  await sql.unsafe(
    `alter table "${table}" add constraint "${name}" foreign key ("branch_id") ` +
      `references dealer_branches(id) on delete set null`
  )
  console.log(`  + ${name}`)
}

console.table(
  await sql`
    select table_name, column_name from information_schema.columns
    where (table_name = 'user' and column_name in ('member_type', 'branch_id'))
       or (table_name = 'product_registrations' and column_name = 'branch_id')
       or (table_name = 'dealer_branches' and column_name = 'match_key')
    order by table_name, column_name`
)

await sql.end()
