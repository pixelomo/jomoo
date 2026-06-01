import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { validateSerialNumber } from '@/lib/serialValidation'

const RequestSchema = z.object({ serialNumber: z.string().min(1) })

// Public endpoint — used by the /verify page (no auth required)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sn = searchParams.get('sn') ?? ''
  if (!sn.trim()) return NextResponse.json({ error: 'Missing serial number' }, { status: 400 })
  const result = await validateSerialNumber(sn.trim())
  return NextResponse.json(result)
}

// Auth-gated endpoint — used during the registration form serial-validation step
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const result = await validateSerialNumber(parsed.data.serialNumber)
  return NextResponse.json(result)
}
