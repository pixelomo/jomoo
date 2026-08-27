// The cookie-consent model, shared by the server (which reads the cookie in the
// site layout so the banner does not flash on every page) and the client (which
// writes it). Everything here is pure — no document, no headers — so it can be
// imported from either side.

export const CONSENT_COOKIE = 'jomoo_consent'

// Bump when the categories change or the policy behind them does: an older
// version parses as "no answer yet", so everyone is asked again rather than
// being held to a choice they made about a different set of cookies.
export const CONSENT_VERSION = 1

// Six months. Long enough not to nag, short enough that a stale choice expires
// on its own — the common reading of "consent does not last forever".
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

// Order matters: it is the bit order in the stored value. Append, never insert,
// and bump CONSENT_VERSION when you do.
export const OPTIONAL_CATEGORIES = ['analytics', 'media'] as const

export type ConsentCategory = (typeof OPTIONAL_CATEGORIES)[number]
export type Consent = Record<ConsentCategory, boolean>

// The starting point for everything: nothing optional until they say so.
export const DECLINE_ALL: Consent = { analytics: false, media: false }

/** e.g. `v1.10` — analytics on, external media off. */
export function serializeConsent(consent: Consent): string {
  const bits = OPTIONAL_CATEGORIES.map((key) => (consent[key] ? '1' : '0')).join('')
  return `v${CONSENT_VERSION}.${bits}`
}

/**
 * `null` means "no usable answer on file" — never chose, cookie was cleared, or
 * the value predates the current categories. The caller shows the banner and
 * treats every optional category as refused until they answer.
 */
export function parseConsent(raw: string | null | undefined): Consent | null {
  if (!raw) return null

  const match = /^v(\d+)\.([01]+)$/.exec(raw)
  if (!match) return null
  if (Number(match[1]) !== CONSENT_VERSION) return null

  const bits = match[2]
  if (bits.length !== OPTIONAL_CATEGORIES.length) return null

  const consent = { ...DECLINE_ALL }
  OPTIONAL_CATEGORIES.forEach((key, i) => {
    consent[key] = bits[i] === '1'
  })
  return consent
}

/** What is allowed before — or without — an answer. */
export function allowed(consent: Consent | null, category: ConsentCategory): boolean {
  return consent?.[category] ?? false
}
