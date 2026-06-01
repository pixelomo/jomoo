import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
})

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ user: session.user })
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rawBody: unknown
  try { rawBody = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateUserSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 422 })
  }

  const d = parsed.data
  await db.update(user).set({
    ...(d.name !== undefined && { name: d.name }),
    ...(d.gender !== undefined && { gender: d.gender }),
    ...(d.dateOfBirth !== undefined && { dateOfBirth: d.dateOfBirth }),
    updatedAt: new Date(),
  }).where(eq(user.id, session.user.id))

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Deleting the user record cascades to product_registrations, warranty_records,
  // sessions, and accounts via FK ON DELETE CASCADE in the schema.
  await db.delete(user).where(eq(user.id, session.user.id))

  return NextResponse.json({ success: true })
}
