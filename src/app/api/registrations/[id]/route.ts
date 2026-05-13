import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase'

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

async function resolveOwnedRegistration(userId: string, regId: string) {
  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()
  if (!user) return null

  const { data: reg } = await supabase
    .from('product_registrations')
    .select('id, status')
    .eq('id', regId)
    .eq('user_id', user.id)
    .single()
  return reg ?? null
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const reg = await resolveOwnedRegistration(userId, id)
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!MUTABLE_STATUSES.includes(reg.status)) {
    return NextResponse.json({ error: 'Cannot delete an approved registration' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('product_registrations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = EditableFieldsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 422 })
  }

  const reg = await resolveOwnedRegistration(userId, id)
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!MUTABLE_STATUSES.includes(reg.status)) {
    return NextResponse.json({ error: 'Cannot edit an approved registration' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('product_registrations')
    .update(parsed.data)
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ success: true })
}
