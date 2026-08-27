/**
 * Gives the accounts that predate the dealer feature a member type and a branch.
 *
 * 法人 and 個人 were only ever a step in the sign-up form — nothing recorded
 * which one an account chose, so an existing dealer would sign in to a portal
 * with no 支店の登録製品 tab. A 会社名 is the only evidence left of the choice,
 * so that is what this reads, and it is why the backfill is a script that can
 * be inspected rather than something the app infers on every request.
 *
 * Registrations are matched to a branch by the 販売店 text the customer typed,
 * normalised the same way lib/dealerBranches.ts normalises it. Anything that
 * does not match exactly is left alone — a wrong match would put one customer's
 * details in front of another dealer.
 *
 * Usage: node scripts/backfill-dealer-branches.mjs          (report only)
 *        node scripts/backfill-dealer-branches.mjs --apply  (writes)
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'

const APPLY = process.argv.includes('--apply')

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .match(/DATABASE_URL=(.*)/)[1]
  .trim()
const sql = postgres(url, { max: 1 })

/** Must stay in step with branchMatchKey() in src/lib/dealerBranches.ts. */
const fold = (value) =>
  (value ?? '')
    .normalize('NFKC')
    .replace(/[\s　・．,，.-]/g, '')
    .toLowerCase()

const matchKey = (name, postalCode) => `${fold(name)}|${fold(postalCode)}`

const corporates = await sql`
  select id, name, email, company_name, company_name_kana, postal_code,
         prefecture, city, street_address, building, member_type, branch_id
  from "user"
  where company_name is not null and company_name <> ''`

console.log(`${corporates.length} account(s) with a 会社名.`)

const branches = new Map(
  (await sql`select id, match_key from dealer_branches`).map((b) => [b.match_key, b.id])
)

let created = 0
let linked = 0
let typed = 0

for (const member of corporates) {
  const key = matchKey(member.company_name, member.postal_code)
  let branchId = branches.get(key)

  if (!branchId) {
    branchId = randomUUID()
    console.log(`  + branch ${member.company_name} (${member.postal_code ?? 'no 〒'})`)
    if (APPLY) {
      await sql`
        insert into dealer_branches
          (id, name, name_kana, postal_code, prefecture, city, street_address, building, match_key)
        values (${branchId}, ${member.company_name}, ${member.company_name_kana},
                ${member.postal_code}, ${member.prefecture}, ${member.city},
                ${member.street_address}, ${member.building}, ${key})`
    }
    branches.set(key, branchId)
    created++
  }

  if (member.member_type !== 'corporate') typed++
  if (member.branch_id !== branchId) linked++

  if (APPLY) {
    await sql`
      update "user"
      set member_type = 'corporate', branch_id = ${branchId}
      where id = ${member.id}`
  }
}

// Everyone else is an individual. Stated rather than left null so the dashboard
// never has to guess a second time.
const individuals = await sql`
  select count(*)::int as n from "user"
  where member_type is null and (company_name is null or company_name = '')`

if (APPLY) {
  await sql`
    update "user" set member_type = 'individual'
    where member_type is null and (company_name is null or company_name = '')`
}

// Past registrations only carry the typed 販売店 name, so an exact normalised
// match is the most that can be claimed. The rest stay unattached.
const unattached = await sql`
  select id, dealer_name from product_registrations
  where branch_id is null and dealer_name is not null and dealer_name <> ''`

let matched = 0
for (const reg of unattached) {
  // Postal code is unknown on a typed name, so the name alone has to decide —
  // and only when exactly one branch answers to it.
  const candidates = [...branches.entries()].filter(
    ([key]) => key.split('|')[0] === fold(reg.dealer_name)
  )
  if (candidates.length !== 1) continue

  matched++
  if (APPLY) {
    await sql`update product_registrations set branch_id = ${candidates[0][1]} where id = ${reg.id}`
  }
}

console.log(
  [
    `branches created:        ${created}`,
    `accounts marked 法人:     ${typed}`,
    `accounts linked:         ${linked}`,
    `accounts marked 個人:     ${individuals[0].n}`,
    `registrations attached:  ${matched} of ${unattached.length} with a typed 販売店`,
  ].join('\n')
)
console.log(APPLY ? '\nApplied.' : '\nDry run — re-run with --apply to write.')

await sql.end()
