import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { ContactSchema } from '@/types/contact'
import { db } from '@/lib/db'
import { contactSubmission } from '@/lib/db/schema'

export async function POST(request: Request) {
  let parsed
  try {
    parsed = ContactSchema.safeParse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const data = parsed.data
  const { sendContactInquiry, sendContactAcknowledgement, contactAddressFor } = await import(
    '@/lib/resend'
  )

  // Recorded before the send, so an enquiry survives a delivery failure instead
  // of disappearing with it — and so staff have something to export.
  const id = crypto.randomUUID()
  try {
    await db.insert(contactSubmission).values({
      id,
      category: data.category,
      lastName: data.lastName,
      firstName: data.firstName,
      companyName: data.companyName ?? null,
      email: data.email,
      countryCode: data.countryCode ?? null,
      phoneNumber: data.phoneNumber ?? null,
      message: data.message,
      showroomReservation: data.showroomReservation,
      preferredDateTime: data.preferredDateTime ?? null,
      routedTo: contactAddressFor(data.category),
      delivered: false,
    })
  } catch (err) {
    // Losing the record is bad, but refusing the enquiry is worse — carry on to
    // the email so the visitor is not turned away.
    console.error('[contact] could not record submission', err)
  }

  try {
    await sendContactInquiry(data)
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }

  try {
    await db.update(contactSubmission).set({ delivered: true }).where(eq(contactSubmission.id, id))
  } catch {
    // The mail went out; a missed flag is not worth failing the request over.
  }

  // The enquiry already reached the department, so a failed acknowledgement
  // must not turn a successful submission into an error for the visitor.
  try {
    await sendContactAcknowledgement(data)
  } catch (err) {
    console.error('[contact] acknowledgement failed', err)
  }

  return NextResponse.json({ ok: true })
}
