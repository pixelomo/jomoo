import { db } from './db'
import { dealerBranch, user } from './db/schema'
import { asc, eq } from 'drizzle-orm'

export interface BranchOption {
  id: string
  name: string
  /** 都道府県 + 市区町村, so two branches of one chain can be told apart. */
  locality: string | null
}

/**
 * Full-width characters, spaces and case all vary between people typing the
 * same company name, and two colleagues signing up separately must land on one
 * branch rather than two. The postal code is what separates branches of the
 * same chain — it is the one part of an address nobody rephrases.
 */
export function branchMatchKey(name: string, postalCode?: string | null) {
  const fold = (value: string) =>
    value
      .normalize('NFKC')
      .replace(/[\s　・．,，.-]/g, '')
      .toLowerCase()

  return `${fold(name)}|${fold(postalCode ?? '')}`
}

type BranchSource = {
  companyName?: string | null
  companyNameKana?: string | null
  postalCode?: string | null
  prefecture?: string | null
  city?: string | null
  streetAddress?: string | null
  building?: string | null
}

/**
 * Finds the branch a corporate member belongs to, creating it if this is the
 * first person from it to sign up. Returns null when there is no company name
 * to go on — the account is simply left without a branch rather than given an
 * empty one to share with every other nameless account.
 */
export async function ensureBranch(source: BranchSource): Promise<string | null> {
  const name = source.companyName?.trim()
  if (!name) return null

  const matchKey = branchMatchKey(name, source.postalCode)

  const [existing] = await db
    .select({ id: dealerBranch.id })
    .from(dealerBranch)
    .where(eq(dealerBranch.matchKey, matchKey))
    .limit(1)

  if (existing) return existing.id

  // Two sign-ups from one branch can race each other here; the unique index on
  // match_key decides, and the loser reads back the winner's row.
  try {
    const [created] = await db
      .insert(dealerBranch)
      .values({
        name,
        nameKana: source.companyNameKana ?? null,
        postalCode: source.postalCode ?? null,
        prefecture: source.prefecture ?? null,
        city: source.city ?? null,
        streetAddress: source.streetAddress ?? null,
        building: source.building ?? null,
        matchKey,
      })
      .returning({ id: dealerBranch.id })

    return created?.id ?? null
  } catch {
    const [raced] = await db
      .select({ id: dealerBranch.id })
      .from(dealerBranch)
      .where(eq(dealerBranch.matchKey, matchKey))
      .limit(1)
    return raced?.id ?? null
  }
}

/** Creates the branch for a newly registered corporate member and links them
 *  to it. Never throws — an account is worth more than its branch link, which
 *  an admin can repair afterwards. */
export async function linkMemberToBranch(userId: string, source: BranchSource) {
  try {
    const branchId = await ensureBranch(source)
    if (!branchId) return null
    await db.update(user).set({ branchId }).where(eq(user.id, userId))
    return branchId
  } catch (err) {
    console.error('[dealerBranches] could not link member to branch', { userId, err })
    return null
  }
}

/** The 販売店 select on the product registration form. */
export async function listBranchOptions(): Promise<BranchOption[]> {
  const rows = await db
    .select({
      id: dealerBranch.id,
      name: dealerBranch.name,
      prefecture: dealerBranch.prefecture,
      city: dealerBranch.city,
    })
    .from(dealerBranch)
    .orderBy(asc(dealerBranch.name))

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    locality: [row.prefecture, row.city].filter(Boolean).join(' ') || null,
  }))
}

export async function branchExists(id: string) {
  const [row] = await db
    .select({ id: dealerBranch.id })
    .from(dealerBranch)
    .where(eq(dealerBranch.id, id))
    .limit(1)
  return Boolean(row)
}

export async function getBranch(id: string) {
  const [row] = await db.select().from(dealerBranch).where(eq(dealerBranch.id, id)).limit(1)
  return row ?? null
}
