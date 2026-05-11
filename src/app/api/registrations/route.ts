import { auth } from '@clerk/nextjs/server'
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

  // Get internal user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, nickname')
    .eq('clerk_id', userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Determine if serial number is flagged for review
  const flagged = data.proceedDespiteInvalid === true && data.serialNumberValid === false

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

  // Send confirmation email (non-blocking)
  sendRegistrationConfirmation({
    to: user.email,
    name: user.nickname ?? data.contactPerson,
    modelName: data.modelName,
    registrationId: registration.id,
  }).catch((err) => console.error('Email send error:', err))

  return NextResponse.json({ id: registration.id }, { status: 201 })
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
