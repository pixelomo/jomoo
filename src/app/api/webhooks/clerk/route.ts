import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

interface ClerkUserCreatedEvent {
  type: 'user.created' | 'user.updated'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    public_metadata: Record<string, unknown>
    unsafe_metadata: Record<string, unknown>
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.text()

  let event: ClerkUserCreatedEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserCreatedEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'user.created' && event.type !== 'user.updated') {
    return NextResponse.json({ message: 'Ignored' })
  }

  const { id: clerkId, email_addresses, primary_email_address_id } = event.data
  const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id)
  const email = primaryEmail?.email_address

  if (!email) {
    return NextResponse.json({ error: 'No primary email found' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'user.created') {
    const { error } = await supabase.from('users').insert({
      clerk_id: clerkId,
      email,
    })

    if (error) {
      console.error('Failed to insert user:', error)
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
    }
  } else {
    // user.updated - sync email if changed
    const { error } = await supabase
      .from('users')
      .update({ email })
      .eq('clerk_id', clerkId)

    if (error) {
      console.error('Failed to update user:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
