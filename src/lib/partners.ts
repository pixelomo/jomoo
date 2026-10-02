import 'server-only'
import { and, desc, eq, ilike, inArray, isNull, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user, dealerBranch } from '@/lib/db/schema'
import { linkMemberToBranch } from '@/lib/dealerBranches'

export type PartnerDecision = 'approved' | 'rejected'

/**
 * Approves or rejects a パートナー application.
 *
 * A sign-up only records the application; the branch, which is what puts the
 * company on the 販売店 list and opens the 支店の登録製品 tab, is created here
 * on approval. Rejecting (including withdrawing an earlier approval) unlinks
 * the account from its branch, but leaves the branch itself: registrations
 * customers already filed against it still name it.
 */
export async function reviewPartner(userId: string, decision: PartnerDecision, reviewer: string) {
  const [member] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!member) return { ok: false as const, error: 'NOT_FOUND' }
  if (member.memberType !== 'partner') return { ok: false as const, error: 'NOT_A_PARTNER' }

  const branchId =
    decision === 'approved'
      ? member.branchId ?? (await linkMemberToBranch(member.id, member))
      : null

  await db
    .update(user)
    .set({
      partnerStatus: decision,
      partnerReviewedAt: new Date(),
      partnerReviewedBy: reviewer,
      branchId,
    })
    .where(eq(user.id, userId))

  // The decision stands whether or not the mail lands; the member sees the
  // result on their マイページ either way.
  if (member.partnerStatus !== decision) {
    try {
      const { sendPartnerReviewResult } = await import('@/lib/resend')
      await sendPartnerReviewResult({
        to: member.email,
        name: member.name || member.email,
        approved: decision === 'approved',
      })
    } catch (err) {
      console.error('[partners] review result email failed', { userId, err })
    }
  }

  return { ok: true as const, branchId }
}

export interface PartnerFilters {
  q?: string
  /** 'pending' | 'approved' | 'rejected', or empty for all. */
  status?: string
  /** Restricts to these accounts — the rows ticked on the Partners page. */
  ids?: string[]
}

/** One filter for the Partners page and its CSV, so a download holds exactly
 *  the rows the page was showing. A partner with no status is pending. */
export function partnerWhere({ q = '', status = '', ids }: PartnerFilters): SQL {
  const conditions: SQL[] = [eq(user.memberType, 'partner')]
  const term = q.trim()
  if (term) {
    const like = `%${term}%`
    conditions.push(
      or(
        ilike(user.companyName, like),
        ilike(user.companyNameKana, like),
        ilike(user.name, like),
        ilike(user.email, like),
        ilike(user.phoneNumber, like),
        ilike(user.prefecture, like),
        ilike(user.city, like),
        ilike(user.postalCode, like)
      )!
    )
  }
  if (status === 'pending') conditions.push(or(eq(user.partnerStatus, 'pending'), isNull(user.partnerStatus))!)
  else if (status) conditions.push(eq(user.partnerStatus, status))
  if (ids?.length) conditions.push(inArray(user.id, ids))
  return and(...conditions)!
}

export function listPartners(filters: PartnerFilters) {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      companyNameKana: user.companyNameKana,
      lastName: user.lastName,
      firstName: user.firstName,
      lastNameKana: user.lastNameKana,
      firstNameKana: user.firstNameKana,
      phoneNumber: user.phoneNumber,
      postalCode: user.postalCode,
      prefecture: user.prefecture,
      city: user.city,
      streetAddress: user.streetAddress,
      building: user.building,
      partnerStatus: user.partnerStatus,
      partnerReviewedAt: user.partnerReviewedAt,
      partnerReviewedBy: user.partnerReviewedBy,
      branchId: user.branchId,
      branchName: dealerBranch.name,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(dealerBranch, eq(dealerBranch.id, user.branchId))
    .where(partnerWhere(filters))
    .orderBy(desc(user.createdAt))
}

export type PartnerRow = Awaited<ReturnType<typeof listPartners>>[number]
