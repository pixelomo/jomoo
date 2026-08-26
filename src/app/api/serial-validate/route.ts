import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { findRegistrationBySerial } from '@/lib/serialRegistry'
import { validateSerialNumber } from '@/lib/serialLibrary'
import { callerKey, rateLimit, tooManyRequests } from '@/lib/rateLimit'

const RequestSchema = z.object({
  serialNumber: z.string().min(1),
  /** Recorded by the form; no longer part of deciding whether a serial is real. */
  modelSeries: z.string().optional(),
})

/**
 * How many serials one caller may check per minute.
 *
 * This endpoint answers "is this a real serial number", which is exactly what
 * /verify is for and exactly what makes it worth abusing: left open it is a
 * way to walk the serial library one guess at a time. A customer holding a
 * product in their hand checks one number, or a few if they mistype — well
 * inside this. A script working through the space is not.
 */
const PUBLIC_LIMIT = 10
const SIGNED_IN_LIMIT = 30
const WINDOW_MS = 60_000

// Public endpoint — used by the /verify page (no auth required)
export async function GET(req: Request) {
  const limit = rateLimit(callerKey(req, 'serial-verify'), PUBLIC_LIMIT, WINDOW_MS)
  if (!limit.ok) return tooManyRequests(limit.retryAfter)

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

  // Looser than the public check: this one is behind an account, and a member
  // correcting a mistyped serial should never meet a wall. Keyed by the member
  // rather than the address, so an office behind one IP is not one bucket.
  const limit = rateLimit(`serial-validate:${session.user.id}`, SIGNED_IN_LIMIT, WINDOW_MS)
  if (!limit.ok) return tooManyRequests(limit.retryAfter)

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const result = await validateSerialNumber(parsed.data.serialNumber)

  // Only for signed-in members mid-registration. The public GET above
  // deliberately skips this — it would let anyone probe which serials exist.
  if (result.valid && (await findRegistrationBySerial(parsed.data.serialNumber))) {
    return NextResponse.json({ valid: false, reason: 'already_registered' })
  }

  return NextResponse.json(result)
}
