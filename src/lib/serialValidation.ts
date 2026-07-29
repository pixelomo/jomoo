/**
 * Serial number validation.
 *
 * Two stages, in order:
 *
 *   1. Format — every JOMOO serial is "J" followed by 19 digits. This is the
 *      only check available today: the products have not been manufactured, so
 *      no list of issued serial numbers exists yet. Confirmed with the client
 *      that a correctly formatted number is accepted on that basis.
 *
 *   2. Lookup — once the factory can supply a serial database, set
 *      SERIAL_VALIDATION_ENDPOINT and every serial is checked against it as
 *      well. Nothing else in the app needs to change.
 *
 * Callers must treat this as the only source of truth: never accept a
 * client-supplied "this serial is valid" flag, or a member can issue
 * themselves a warranty.
 */

export const SERIAL_NUMBER_PATTERN = /^J\d{19}$/

/** Human-readable form used in hints and placeholders. */
export const SERIAL_NUMBER_LENGTH = 20

export type SerialValidationReason =
  /** Format is correct; there is no serial database to check it against yet. */
  | 'format_only'
  /** Confirmed against the client's serial database. */
  | 'verified'
  | 'invalid_format'
  | 'not_found'
  | 'service_unavailable'

export interface SerialValidationResult {
  valid: boolean
  reason: SerialValidationReason
}

/**
 * Every dash-like character a serial might be typed or pasted with: ASCII
 * hyphen, the U+2010–U+2015 dashes (including en and em), the minus sign, and
 * the full-width hyphen. Written as escapes — the literal glyphs are too easy
 * to mistake for one another when editing.
 */
const SEPARATORS = /[\s\u002D\u2010-\u2015\u2212\uFF0D]/g

/**
 * Uppercases and removes the spaces and dashes people type when copying a
 * number off a product label. The normalised form is what gets stored, so that
 * two members entering the same serial differently still collide.
 *
 * NFKC first: a Japanese IME produces full-width digits (Ｊ１２３…), which
 * would otherwise fail the pattern for no reason the member can see.
 */
export function normaliseSerialNumber(input: string): string {
  return input.normalize('NFKC').replace(SEPARATORS, '').toUpperCase()
}

export function hasValidSerialFormat(input: string): boolean {
  return SERIAL_NUMBER_PATTERN.test(normaliseSerialNumber(input))
}

export async function validateSerialNumber(
  serialNumber: string
): Promise<SerialValidationResult> {
  const serial = normaliseSerialNumber(serialNumber)

  if (!SERIAL_NUMBER_PATTERN.test(serial)) {
    return { valid: false, reason: 'invalid_format' }
  }

  const endpoint = process.env.SERIAL_VALIDATION_ENDPOINT
  if (!endpoint) return { valid: true, reason: 'format_only' }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SERIAL_VALIDATION_API_KEY}`,
      },
      body: JSON.stringify({ serialNumber: serial }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error(`[serial] validation API error: ${response.status}`)
      return { valid: false, reason: 'service_unavailable' }
    }

    const data = await response.json()
    return data.valid
      ? { valid: true, reason: 'verified' }
      : { valid: false, reason: 'not_found' }
  } catch (error) {
    console.error('[serial] validation request failed', error)
    return { valid: false, reason: 'service_unavailable' }
  }
}
