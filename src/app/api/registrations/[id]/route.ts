import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const EditableFieldsSchema = z.object({
  installation_date: z.string().optional(),
  installation_address_state: z.string().optional(),
  installation_address_detail: z.string().optional(),
  contact_person: z.string().min(1).optional(),
  phone_number: z.string().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  dealer_name: z.string().nullable().optional(),
})

const MUTABLE_STATUSES = ['PENDING', 'RETURNED']

async function getOwnedRegistration(userId: string, regId: string) {
  const [reg] = await db
    .select({ id: productRegistration.id, status: productRegistration.status })
    .from(productRegistration)
    .where(and(eq(productRegistration.id, regId), eq(productRegistration.userId, userId)))
    .limit(1)
  return reg ?? null
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const reg = await getOwnedRegistration(session.user.id, id)
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!MUTABLE_STATUSES.includes(reg.status)) {
    return NextResponse.json({ error: 'Cannot delete an approved registration' }, { status: 403 })
  }

  await db.delete(productRegistration).where(eq(productRegistration.id, id))
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = EditableFieldsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 422 })
  }

  const reg = await getOwnedRegistration(session.user.id, id)
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!MUTABLE_STATUSES.includes(reg.status)) {
    return NextResponse.json({ error: 'Cannot edit an approved registration' }, { status: 403 })
  }

  const d = parsed.data
  await db.update(productRegistration).set({
    ...(d.installation_date !== undefined && { installationDate: d.installation_date }),
    ...(d.installation_address_state !== undefined && { installationAddressState: d.installation_address_state }),
    ...(d.installation_address_detail !== undefined && { installationAddressDetail: d.installation_address_detail }),
    ...(d.contact_person !== undefined && { contactPerson: d.contact_person }),
    ...(d.phone_number !== undefined && { phoneNumber: d.phone_number }),
    ...(d.purchase_date !== undefined && { purchaseDate: d.purchase_date }),
    ...(d.dealer_name !== undefined && { dealerName: d.dealer_name }),
    updatedAt: new Date(),
  }).where(eq(productRegistration.id, id))

  return NextResponse.json({ success: true })
}
