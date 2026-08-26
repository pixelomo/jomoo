/**
 * A small fixed-window rate limiter, held in memory.
 *
 * Per-instance, and serverless runs several at once, so a limit of 10 is really
 * "10 per instance the request happens to land on". It thins a determined
 * caller rather than capping them exactly — the same trade the verification
 * email throttle makes. Worth knowing before it is relied on for anything that
 * must be exact; that would need a shared store.
 *
 * Deliberately has no dependencies and no I/O, so a limiter failing can never
 * be the reason a request fails.
 */

interface Window {
  count: number
  /** Epoch ms at which the count goes back to zero. */
  resetAt: number
}

const windows = new Map<string, Window>()

/**
 * Above this, expired entries are swept before anything else is added. An
 * instance that lives for days would otherwise hold a row per caller forever.
 */
const MAX_TRACKED = 10_000

export interface RateLimitResult {
  ok: boolean
  /** Whole seconds until the window resets, for the Retry-After header. */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  if (windows.size > MAX_TRACKED) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k)
  }

  const current = windows.get(key)
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  current.count++
  if (current.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfter: 0 }
}

/**
 * Who to count a request against.
 *
 * x-forwarded-for is set by Vercel's proxy and its first entry is the client.
 * A caller can send the header themselves, but not past the proxy — it appends
 * rather than trusting what arrived. Falls back to a single shared bucket when
 * there is no address at all, which limits harder rather than not at all.
 */
export function callerKey(req: Request, scope: string): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown'
  return `${scope}:${ip}`
}

/** 429 with the header a well-behaved client waits on. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(JSON.stringify({ error: 'RATE_LIMITED' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
      'Cache-Control': 'no-store',
    },
  })
}
