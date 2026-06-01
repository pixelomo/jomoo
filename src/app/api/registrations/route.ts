import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { RegistrationSchema } from '@/types/registration'
import { createAdminClient } from '@/lib/supabase'
import { sendRegistrationConfirmation } from '@/lib/resend'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RegistrationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const supabase = createAdminClient()

  // Get internal user record, auto-creating if the Clerk webhook hasn't synced yet
  let { data: user } = await supabase
    .from('users')
    .select('id, email, nickname')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'Could not resolve user email' }, { status: 500 })
    }
    const { data: created } = await supabase
      .from('users')
      .insert({ clerk_id: userId, email })
      .select('id, email, nickname')
      .single()
    if (!created) {
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
    }
    user = created
  }

  // Flag for review if serial validation failed (user proceeded without a valid serial)
  const flagged = data.serialNumberValid === false

  const { data: registration, error: insertError } = await supabase
    .from('product_registrations')
    .insert({
      user_id: user.id,
      model_id: data.modelId,
      model_name: data.modelName,
      installation_date: data.installationDate,
      installation_address_state: data.installationAddressState,
      installation_address_detail: data.installationAddressDetail,
      contact_person: data.contactPerson,
      phone_number: data.phoneNumber ?? null,
      purchase_date: data.purchaseDate ?? null,
      dealer_name: data.dealerName ?? null,
      serial_number: data.serialNumber,
      serial_number_valid: data.serialNumberValid ?? null,
      warranty_card_url: data.warrantyCardUrl,
      serial_number_image_url: data.serialNumberImageUrl,
      status: 'PENDING',
      flagged_for_review: flagged,
    })
    .select('id')
    .single()

  if (insertError || !registration) {
    console.error('Registration insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save registration' }, { status: 500 })
  }

  // Auto-approve and generate warranty card when serial number is verified
  let finalStatus: string = 'PENDING'
  if (data.serialNumberValid === true) {
    const baseDate = data.installationDate
      ? new Date(data.installationDate)
      : new Date()
    const expiryDate = new Date(baseDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + 2)
    const expiryStr = expiryDate.toISOString().split('T')[0]

    const [updateResult, warrantyResult] = await Promise.all([
      supabase
        .from('product_registrations')
        .update({ status: 'REGISTERED_WITH_WARRANTY', reviewed_at: new Date().toISOString() })
        .eq('id', registration.id),
      supabase
        .from('warranty_records')
        .insert({ registration_id: registration.id, expiry_date: expiryStr, card_generated: true }),
    ])

    if (!updateResult.error && !warrantyResult.error) {
      finalStatus = 'REGISTERED_WITH_WARRANTY'
    }
  }

  // Send confirmation email (non-blocking)
  sendRegistrationConfirmation({
    to: user.email,
    name: user.nickname ?? data.contactPerson,
    modelName: data.modelName,
    registrationId: registration.id,
  }).catch((err) => console.error('Email send error:', err))

  return NextResponse.json({ id: registration.id, status: finalStatus }, { status: 201 })
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ registrations: [] })
  }

  const { data: registrations, error } = await supabase
    .from('product_registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
  }

  return NextResponse.json({ registrations })
}
