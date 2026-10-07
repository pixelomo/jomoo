import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productRegistration, user, warrantyRecord } from '@/lib/db/schema'
import { warrantyTermFor } from '@/lib/warranty'

/**
 * What a reviewer can decide about a registration the serial library could not
 * confirm on its own (PENDING), or one sent back that the member has since
 * corrected (RETURNED).
 */
export const REVIEW_DECISIONS = ['REGISTERED_WITH_WARRANTY', 'REGISTERED_NO_WARRANTY', 'RETURNED'] as const
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number]

/** Only these can still be reviewed; a registered product is settled. */
export const REVIEWABLE_STATUSES = ['PENDING', 'RETURNED']

/**
 * Records a reviewer's decision and tells the member.
 *
 * Issuing a warranty here follows the same rule the automatic approval does —
 * 5 years when the registration arrived within 3 months of the 設置日, else 2 —
 * judged by when the member submitted it, not by when staff got to it, so a
 * slow review never costs a member the extension.
 *
 * Returning a registration needs a reason: the email sends the member to their
 * マイページ, where the reason is shown, to correct it.
 */
export async function reviewRegistration(
  id: string,
  decision: ReviewDecision,
  reviewer: string,
  note: string
) {
  const [reg] = await db
    .select({
      id: productRegistration.id,
      status: productRegistration.status,
      installationDate: productRegistration.installationDate,
      submittedAt: productRegistration.submittedAt,
      email: user.email,
      name: user.name,
    })
    .from(productRegistration)
    .leftJoin(user, eq(user.id, productRegistration.userId))
    .where(eq(productRegistration.id, id))
    .limit(1)

  if (!reg) return { ok: false as const, error: 'NOT_FOUND' }
  if (!REVIEWABLE_STATUSES.includes(reg.status)) return { ok: false as const, error: 'ALREADY_REVIEWED' }
  if (decision === 'RETURNED' && !note) return { ok: false as const, error: 'REASON_REQUIRED' }

  await db.transaction(async (tx) => {
    await tx
      .update(productRegistration)
      .set({
        status: decision,
        reviewedAt: new Date(),
        reviewerId: reviewer,
        reviewNotes: note || null,
        updatedAt: new Date(),
      })
      .where(eq(productRegistration.id, id))

    if (decision === 'REGISTERED_WITH_WARRANTY') {
      const { expiryDate } = warrantyTermFor(reg.installationDate, reg.submittedAt)
      await tx
        .insert(warrantyRecord)
        .values({ registrationId: id, expiryDate, cardGenerated: true })
        .onConflictDoUpdate({
          target: warrantyRecord.registrationId,
          set: { expiryDate, cardGenerated: true, updatedAt: new Date() },
        })
    }
  })

  // The decision stands whether or not the mail lands; the member sees the
  // result on their マイページ either way.
  let emailed = false
  if (reg.email) {
    try {
      const { sendReviewStatusUpdate } = await import('@/lib/resend')
      const result = await sendReviewStatusUpdate({
        to: reg.email,
        name: reg.name || reg.email,
        status: decision,
        registrationId: decision === 'REGISTERED_WITH_WARRANTY' ? id : undefined,
        reviewNote: note,
      })
      emailed = !('skipped' in result)
    } catch (err) {
      console.error('[registrations] review result email failed', { id, err })
    }
  }

  return { ok: true as const, emailed }
}
