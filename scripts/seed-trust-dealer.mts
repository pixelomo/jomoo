/**
 * Puts 株式会社TRUST — the dealer that runs the 東京ショールーム — on the dealer
 * list, and optionally gives it the 法人 account that owns it.
 *
 * Every other branch arrived as a 法人 sign-up. This one already exists in the
 * world and its details are printed on /showroom, so rather than wait for
 * somebody to type them in again they are copied here, from that page, as the
 * one source both now read.
 *
 * The branch is seeded unconditionally: that is what puts TRUST in the 販売店
 * select on the product registration form and in the portal's dealer list, and
 * it needs no credentials. The account is created only when one is supplied,
 * because a sign-in address cannot be invented — a wrong one takes the welcome
 * mail and every later password reset with it.
 *
 * Usage: npx tsx scripts/seed-trust-dealer.mts
 *        npx tsx scripts/seed-trust-dealer.mts --email dealer@example.com --password 'S3cret…'
 *
 * .mts rather than .ts so tsx treats it as ESM — the top-level awaits below
 * load the env file before anything reaches for DATABASE_URL.
 */
import { readFileSync } from 'node:fs'

// Loaded before anything touches the db, and never over a value the shell
// already set — a script pointed at another database must stay pointed at it.
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].trim()
}

const { db } = await import('../src/lib/db')
const { dealerBranch, user } = await import('../src/lib/db/schema')
const { branchMatchKey } = await import('../src/lib/dealerBranches')
const { eq } = await import('drizzle-orm')

/** Straight off components/showroom/ShowroomInfo.tsx. */
const TRUST = {
  name: '株式会社TRUST',
  nameKana: 'カブシキガイシャトラスト',
  postalCode: '2060042',
  prefecture: '東京都',
  city: '多摩市',
  streetAddress: '山王下1-12-12',
  building: '福満ビル 101',
  // TEL is 準備中 on the showroom page, so nothing is invented here; an admin
  // fills it in once the line is live.
  phone: null as string | null,
}

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}

const email = arg('email')
const password = arg('password')

// ─── The branch ───────────────────────────────────────────────────────────────

const matchKey = branchMatchKey(TRUST.name, TRUST.postalCode)
const [existing] = await db
  .select({ id: dealerBranch.id })
  .from(dealerBranch)
  .where(eq(dealerBranch.matchKey, matchKey))
  .limit(1)

const values = {
  name: TRUST.name,
  nameKana: TRUST.nameKana,
  postalCode: TRUST.postalCode,
  prefecture: TRUST.prefecture,
  city: TRUST.city,
  streetAddress: TRUST.streetAddress,
  building: TRUST.building,
  phone: TRUST.phone,
  email: email ?? null,
  matchKey,
  updatedAt: new Date(),
}

let branchId: string
if (existing) {
  // Re-runnable: the showroom page stays the source, so running this again
  // after an address change carries the change through.
  await db.update(dealerBranch).set(values).where(eq(dealerBranch.id, existing.id))
  branchId = existing.id
  console.log(`= branch ${TRUST.name} (${branchId}) updated`)
} else {
  const [created] = await db.insert(dealerBranch).values(values).returning({ id: dealerBranch.id })
  branchId = created.id
  console.log(`+ branch ${TRUST.name} (${branchId}) created`)
}

// ─── The 法人 account ─────────────────────────────────────────────────────────

if (!email || !password) {
  console.log(
    '\n  No --email/--password given, so no account was created.\n' +
      '  TRUST is on the dealer list and in the 販売店 select either way.\n' +
      "  Re-run with the dealer's real sign-in address to give them a login."
  )
  process.exit(0)
}

const [account] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)

if (account) {
  // An account already using that address is linked rather than duplicated —
  // two accounts for one dealer is how a branch ends up split in half.
  await db
    .update(user)
    .set({ memberType: 'corporate', branchId, companyName: TRUST.name, updatedAt: new Date() })
    .where(eq(user.id, account.id))
  console.log(`= account ${email} linked to the branch as 法人`)
  process.exit(0)
}

const { auth } = await import('../src/lib/auth')

await auth.api.signUpEmail({
  body: {
    email,
    password,
    name: `${TRUST.name} / ご担当者`,
    memberType: 'corporate',
    companyName: TRUST.name,
    companyNameKana: TRUST.nameKana,
    postalCode: TRUST.postalCode,
    prefecture: TRUST.prefecture,
    city: TRUST.city,
    streetAddress: TRUST.streetAddress,
    building: TRUST.building,
    lastName: 'TRUST',
    firstName: 'ご担当者',
  },
})

// signUpEmail's create hook builds a branch from the account's own fields. It
// matches on name + postal code, which are the ones seeded above, so it lands
// on the row this script just wrote rather than making a second one — this
// asserts that rather than trusting it.
const [created] = await db
  .select({ id: user.id, branchId: user.branchId })
  .from(user)
  .where(eq(user.email, email))
  .limit(1)

if (created?.branchId !== branchId) {
  await db.update(user).set({ branchId, updatedAt: new Date() }).where(eq(user.id, created.id))
  console.log(`  account was linked to ${created?.branchId ?? 'no branch'}; repointed at ${branchId}`)
}

console.log(`+ account ${email} created as a 法人 member of ${TRUST.name}`)
process.exit(0)
