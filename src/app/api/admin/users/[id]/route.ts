import { NextResponse } from 'next/server'
import { can, getAdminSession } from '@/lib/admin-auth'
import { releaseSerialsForUsers } from '@/lib/serialLibrary'
import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord, dealerBranch } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  memberType: z.enum(['corporate', 'individual']).nullable().optional(),
  branchId: z.string().nullable().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const [u] = await db.select().from(user).where(eq(user.id, id)).limit(1)
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const registrations = await db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      installationDate: productRegistration.installationDate,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.userId, id))
    .orderBy(desc(productRegistration.submittedAt))

  return NextResponse.json({ user: u, registrations })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const d = parsed.data

  // A branch id is checked rather than trusted: it decides whose registrations
  // this account can read on their マイページ, and a typo would either point at
  // nothing or hand someone another dealer's customers.
  if (d.branchId) {
    const [branch] = await db
      .select({ id: dealerBranch.id })
      .from(dealerBranch)
      .where(eq(dealerBranch.id, d.branchId))
      .limit(1)
    if (!branch) return NextResponse.json({ error: 'NO_SUCH_BRANCH' }, { status: 422 })
  }

  await db.update(user).set({
    ...(d.name !== undefined && { name: d.name }),
    ...(d.email !== undefined && { email: d.email }),
    ...(d.gender !== undefined && { gender: d.gender }),
    ...(d.dateOfBirth !== undefined && { dateOfBirth: d.dateOfBirth }),
    ...(d.memberType !== undefined && { memberType: d.memberType }),
    // The branch is only meaningful on a 法人 account, so switching an account
    // to 個人 lets it go rather than leaving a link nothing reads.
    ...(d.memberType === 'individual'
      ? { branchId: null }
      : d.branchId !== undefined && { branchId: d.branchId }),
  }).where(eq(user.id, id))

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session, 'delete')) {
    return NextResponse.json({ error: 'FORBIDDEN', permission: 'delete' }, { status: 403 })
  }
  const { id } = await params

  // Deleting the member cascades their registrations away, which would leave
  // any serial they registered stranded as BOUND to a registration that no
  // longer exists — and unregisterable by the next owner of the product.
  await releaseSerialsForUsers([id], session.username)

  await db.delete(user).where(eq(user.id, id))
  return NextResponse.json({ success: true })
}
