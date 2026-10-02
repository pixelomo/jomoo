import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession } from '@/lib/admin-auth'
import { reviewPartner } from '@/lib/partners'

const ReviewSchema = z.object({ decision: z.enum(['approved', 'rejected']) })

/** Approves or rejects one パートナー application. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

  const result = await reviewPartner(id, parsed.data.decision, session.username)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error === 'NOT_FOUND' ? 404 : 422 })
  }
  return NextResponse.json({ success: true, branchId: result.branchId })
}
