import { NextResponse } from 'next/server'
import { sendVerificationEmailOrThrow } from '@/lib/verification-email'

/**
 * Sends the click-to-verify mail and reports whether it actually left.
 * Better Auth's own /send-verification-email answers 200 even when Resend
 * rejects the message, so both the sign-up and the sign-in resend flows call
 * this instead — a failure here reaches the member.
 */

/** email → last accepted send. Throttles one address to one mail per window. */
const lastSent = new Map<string, number>()
const THROTTLE_MS = 60_000

// Per-instance only: serverless runs several, so this thins repeat sends rather
// than capping them exactly. Resend's own rate limit is the real backstop.
function throttled(email: string) {
  const previous = lastSent.get(email)
  if (previous && Date.now() - previous < THROTTLE_MS) return true
  lastSent.set(email, Date.now())
  return false
}

export async function POST(request: Request) {
  let email: unknown
  let callbackURL: unknown

  try {
    ({ email, callbackURL } = await request.json())
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const normalised = email.trim().toLowerCase()

  // A throttled repeat is not an error to the member — the first mail is on its
  // way, so saying "sent" is both true and the least confusing answer.
  if (throttled(normalised)) return NextResponse.json({ ok: true })

  try {
    // Only relative paths: an absolute callbackURL would turn the verification
    // link into an open redirect off the site.
    const target =
      typeof callbackURL === 'string' && callbackURL.startsWith('/') && !callbackURL.startsWith('//')
        ? callbackURL
        : '/'

    await sendVerificationEmailOrThrow(normalised, target)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // Let the next attempt through — this one never reached the member.
    lastSent.delete(normalised)
    console.error('[verification] send failed', { email: normalised, err })
    return NextResponse.json({ error: 'EMAIL_SEND_FAILED' }, { status: 502 })
  }
}
