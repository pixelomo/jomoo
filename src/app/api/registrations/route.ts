import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, warrantyRecord, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { RegistrationSchema } from '@/types/registration'
import { findRegistrationBySerial, isDuplicateSerialError } from '@/lib/serialRegistry'
import { bindSerialToRegistration, validateSerialNumber } from '@/lib/serialLibrary'
import { warrantyExpiryFrom } from '@/lib/warranty'
import { getBranch } from '@/lib/dealerBranches'
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

  // A branch id is only honoured if it names a real branch — it is what decides
  // which dealer gets to read this registration, so an id invented by the
  // browser must not put a customer's details in front of a stranger. The name
  // is taken from the branch rather than from the body for the same reason.
  const branch = data.branchId ? await getBranch(data.branchId) : null
  const dealerName = branch?.name ?? data.dealerName ?? null

  // Validate server-side and ignore whatever the browser claimed. The request
  // body carries a `serialNumberValid` flag for the form's own UI; trusting it
  // here would let anyone with an account issue themselves a warranty.
  // `data.serialNumber` is already normalised by the schema. Run again here
  // rather than relying on step 2 — a serial's status in the library can change
  // between the two, and the browser's answer is never the one that decides.
  const serialCheck = await validateSerialNumber(data.serialNumber)
  const flagged = !serialCheck.valid

  // One physical product, one registration — by anyone, not just per member.
  if (await findRegistrationBySerial(data.serialNumber)) {
    return NextResponse.json({ error: 'SERIAL_ALREADY_REGISTERED' }, { status: 409 })
  }

  // A serial a person withdrew or flagged is refused outright. Everything else
  // the library will not confirm — not on the list, or the list is unreachable
  // — is accepted and flagged instead, so a member is never turned away over a
  // batch that has not been imported yet.
  if (serialCheck.reason === 'revoked' || serialCheck.reason === 'abnormal') {
    return NextResponse.json(
      { error: serialCheck.reason === 'revoked' ? 'SERIAL_REVOKED' : 'SERIAL_ABNORMAL' },
      { status: 409 }
    )
  }

  // The lookup above is the friendly path; this catches the narrow window where
  // two submissions race each other past it. idx_reg_serial_unique is what
  // actually decides, so a loser gets the same 409 rather than a 500.
  try {
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
      dealerName,
      branchId: branch?.id ?? null,
      serialNumber: data.serialNumber,
      serialNumberValid: serialCheck.valid,
      warrantyCardUrl: data.warrantyCardUrl ?? null,
      serialNumberImageUrl: data.serialNumberImageUrl ?? null,
      status: 'PENDING',
      flaggedForReview: flagged,
    })
  } catch (err) {
    if (isDuplicateSerialError(err)) {
      return NextResponse.json({ error: 'SERIAL_ALREADY_REGISTERED' }, { status: 409 })
    }
    throw err
  }

  // Claim the serial in the library if it is in there. Best effort on purpose:
  // the library is empty until the factory sends a batch, and a member must
  // not be blocked from registering because of it.
  await bindSerialToRegistration({
    serialNumber: data.serialNumber,
    registrationId: id,
    userId: sessionUser.id,
  })

  let finalStatus = 'PENDING'

  if (serialCheck.valid) {
    const expiryStr = warrantyExpiryFrom(data.installationDate)

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
    sendWarrantyIssuedEmail({
      to: sessionUser.email,
      name: sessionUser.name,
      modelName: data.modelName,
      registrationId: id,
      expiryDate: warrantyExpiryFrom(data.installationDate),
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
