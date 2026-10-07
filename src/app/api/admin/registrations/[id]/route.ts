import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord, ownershipTransfer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { REVIEW_DECISIONS, reviewRegistration } from '@/lib/registrationReview'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const [reg] = await db
    .select({
      id: productRegistration.id,
      userId: productRegistration.userId,
      modelId: productRegistration.modelId,
      modelName: productRegistration.modelName,
      installationDate: productRegistration.installationDate,
      installationAddressState: productRegistration.installationAddressState,
      installationAddressCity: productRegistration.installationAddressCity,
      installationAddressDetail: productRegistration.installationAddressDetail,
      contactPerson: productRegistration.contactPerson,
      phoneNumber: productRegistration.phoneNumber,
      purchaseDate: productRegistration.purchaseDate,
      dealerName: productRegistration.dealerName,
      serialNumber: productRegistration.serialNumber,
      serialNumberValid: productRegistration.serialNumberValid,
      warrantyCardUrl: productRegistration.warrantyCardUrl,
      serialNumberImageUrl: productRegistration.serialNumberImageUrl,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.id, id))
    .limit(1)

  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const transfers = await db
    .select()
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.registrationId, id))

  return NextResponse.json({ registration: reg, transfers })
}

const ReviewSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  note: z.string().trim().max(1000).default(''),
})

/** A reviewer's decision on a pending or returned registration; emails the member. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

  const result = await reviewRegistration(id, parsed.data.decision, session.username, parsed.data.note)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error === 'NOT_FOUND' ? 404 : 422 })
  }
  return NextResponse.json({ success: true, emailed: result.emailed })
}
