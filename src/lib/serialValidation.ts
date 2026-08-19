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

/**
 * Digits after the "J" — the length differs by product line, so the rule is
 * keyed on the Sanity series rather than being one pattern for everything.
 *
 * washstand and faucets are the client's defaults until they confirm their own
 * lengths; change the two numbers here and nothing else needs touching.
 */
export const SERIAL_DIGITS_BY_SERIES: Record<string, number> = {
  'smart-toilet': 19,
  'shower-set': 20,
  washstand: 19,
  faucets: 19,
}

/** Used when a serial is checked without knowing which product it belongs to. */
export const DEFAULT_SERIAL_DIGITS = 19

export function serialDigitsFor(series?: string | null): number {
  return (series && SERIAL_DIGITS_BY_SERIES[series]) || DEFAULT_SERIAL_DIGITS
}

export function serialPatternFor(series?: string | null): RegExp {
  return new RegExp(`^J\\d{${serialDigitsFor(series)}}$`)
}

/** Total characters including the leading J. */
export function serialLengthFor(series?: string | null): number {
  return serialDigitsFor(series) + 1
}

/** Widest form any product uses — the input cap must not cut a longer serial short. */
export const MAX_SERIAL_LENGTH =
  Math.max(...Object.values(SERIAL_DIGITS_BY_SERIES), DEFAULT_SERIAL_DIGITS) + 1

/** @deprecated prefer serialPatternFor(series) */
export const SERIAL_NUMBER_PATTERN = serialPatternFor()

/** @deprecated prefer serialLengthFor(series) */
export const SERIAL_NUMBER_LENGTH = MAX_SERIAL_LENGTH

export type SerialValidationReason =
  /** Format is correct; there is no serial database to check it against yet. */
  | 'format_only'
  /** Confirmed against the client's serial database. */
  | 'verified'
  | 'invalid_format'
  | 'not_found'
  /** Someone — not necessarily this member — has already registered it. */
  | 'already_registered'
  /** Withdrawn in the serial library: scrapped, recalled, or issued in error. */
  | 'revoked'
  /** Flagged in the serial library for investigation. */
  | 'abnormal'
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

/**
 * Constrains the field as it is typed: one prefix character followed by digits,
 * capped at the full length. Deliberately does not force the prefix to "J" —
 * rewriting someone's first keystroke is more confusing than letting the format
 * error explain it. Everything that could never be part of a serial (symbols,
 * kana, emoji, a second letter, a 21st character) simply cannot be entered.
 */
export function maskSerialInput(raw: string, series?: string | null): string {
  const cleaned = normaliseSerialNumber(raw).replace(/[^A-Z0-9]/g, '')
  if (!cleaned) return ''
  return (cleaned[0] + cleaned.slice(1).replace(/\D/g, '')).slice(0, serialLengthFor(series))
}

export function hasValidSerialFormat(input: string, series?: string | null): boolean {
  return serialPatternFor(series).test(normaliseSerialNumber(input))
}

export async function validateSerialNumber(
  serialNumber: string,
  /** Sanity series of the product being registered; picks the digit count. */
  series?: string | null
): Promise<SerialValidationResult> {
  const serial = normaliseSerialNumber(serialNumber)

  if (!serialPatternFor(series).test(serial)) {
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
