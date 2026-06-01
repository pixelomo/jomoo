import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, warrantyRecord, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { RegistrationSchema } from '@/types/registration'
import { sendRegistrationConfirmation, sendWarrantyIssuedEmail } from '@/lib/resend'

async function getAuthenticatedUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return null
  return session.user
}

export async function POST(req: Request) {
  const sessionUser = await getAuthenticatedUser(req)
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RegistrationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const id = crypto.randomUUID()
  const flagged = data.serialNumberValid === false

  await db.insert(productRegistration).values({
    id,
    userId: sessionUser.id,
    modelId: data.modelId,
    modelName: data.modelName,
    installationDate: data.installationDate,
    installationAddressState: data.installationAddressState,
    installationAddressDetail: data.installationAddressDetail,
    contactPerson: data.contactPerson,
    phoneNumber: data.phoneNumber ?? null,
    purchaseDate: data.purchaseDate ?? null,
    dealerName: data.dealerName ?? null,
    serialNumber: data.serialNumber,
    serialNumberValid: data.serialNumberValid ?? null,
    warrantyCardUrl: data.warrantyCardUrl ?? null,
    serialNumberImageUrl: data.serialNumberImageUrl ?? null,
    status: 'PENDING',
    flaggedForReview: flagged,
  })

  let finalStatus = 'PENDING'

  if (data.serialNumberValid === true) {
    const baseDate = data.installationDate ? new Date(data.installationDate) : new Date()
    const expiryDate = new Date(baseDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + 2)
    const expiryStr = expiryDate.toISOString().split('T')[0]

    await Promise.all([
      db.update(productRegistration)
        .set({ status: 'REGISTERED_WITH_WARRANTY', reviewedAt: new Date() })
        .where(eq(productRegistration.id, id)),
      db.insert(warrantyRecord).values({
        registrationId: id,
        expiryDate: expiryStr,
        cardGenerated: true,
      }),
    ])
    finalStatus = 'REGISTERED_WITH_WARRANTY'
  }

  // Send appropriate email non-blocking
  if (finalStatus === 'REGISTERED_WITH_WARRANTY') {
    const installDate = data.installationDate ? new Date(data.installationDate) : new Date()
    const expiry = new Date(installDate)
    expiry.setFullYear(expiry.getFullYear() + 2)
    sendWarrantyIssuedEmail({
      to: sessionUser.email,
      name: sessionUser.name,
      modelName: data.modelName,
      registrationId: id,
      expiryDate: expiry.toISOString().split('T')[0],
    }).catch(err => console.error('Warranty email error:', err))
  } else {
    sendRegistrationConfirmation({
      to: sessionUser.email,
      name: sessionUser.name,
      modelName: data.modelName,
      registrationId: id,
    }).catch(err => console.error('Confirmation email error:', err))
  }

  return NextResponse.json({ id, status: finalStatus }, { status: 201 })
}

export async function GET(req: Request) {
  const sessionUser = await getAuthenticatedUser(req)
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const registrations = await db
    .select()
    .from(productRegistration)
    .where(eq(productRegistration.userId, sessionUser.id))
    .orderBy(productRegistration.submittedAt)

  return NextResponse.json({ registrations })
}
