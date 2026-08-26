/**
 * Serial number handling that both the browser and the server can run.
 *
 * There is deliberately no rule here about how long a serial is or what it
 * starts with. The factory's numbers vary by product line and by production
 * run — X40 toilets are 19 characters, the toilets, shower heads and bathroom
 * cabinets shipped since are 20, and letters appear part way through the number
 * as well as at the front (J2339391200000HE1110). Every pattern we invented for
 * that was wrong within a batch, so the only question worth asking is whether
 * the number is one of the ones actually issued — which is a lookup against the
 * imported serial library, in serialLibrary.ts, not something this module can
 * answer.
 *
 * What is left here is the shape of the field: normalise what was typed, strip
 * what could never be part of a serial, and reject the obviously-not-a-serial.
 * It stays free of the database client so the registration form can import it.
 *
 * Callers must treat the library check as the only source of truth: never
 * accept a client-supplied "this serial is valid" flag, or a member can issue
 * themselves a warranty.
 */

/**
 * The product lines, for the admin dropdowns. Purely a label on the row now —
 * the series says which catalogue a serial belongs to, and no longer implies
 * anything about its shape.
 */
export const SERIAL_SERIES = ['smart-toilet', 'shower-set', 'washstand', 'faucets'] as const

/**
 * Bounds wide enough to hold anything the factory has sent or plausibly will.
 * They exist to catch an empty field or a pasted sentence, not to describe a
 * product — nothing should ever be rejected for its length alone.
 */
export const MIN_SERIAL_LENGTH = 6
export const MAX_SERIAL_LENGTH = 40

/** Uppercase letters and digits, in any arrangement. */
export const SERIAL_PATTERN = new RegExp(`^[0-9A-Z]{${MIN_SERIAL_LENGTH},${MAX_SERIAL_LENGTH}}$`)

export type SerialValidationReason =
  /** Confirmed against the imported serial library. */
  | 'verified'
  /** Nothing has been imported yet, so there is nothing to check it against. */
  | 'library_empty'
  | 'invalid_format'
  /** Serials have been imported and this is not one of them. */
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
 * two members entering the same serial differently still collide, and so that
 * an imported serial and a typed one meet in the same shape.
 *
 * NFKC first: a Japanese IME produces full-width characters (Ｊ１２３…), which
 * would otherwise never match the number that was imported.
 */
export function normaliseSerialNumber(input: string): string {
  return input.normalize('NFKC').replace(SEPARATORS, '').toUpperCase()
}

/**
 * Constrains the field as it is typed: letters and digits only, capped at the
 * longest serial we could receive. Deliberately says nothing about where the
 * letters may fall — they turn up mid-number as often as at the front — so the
 * only characters it removes are ones no serial has ever contained.
 */
export function maskSerialInput(raw: string): string {
  return normaliseSerialNumber(raw).replace(/[^0-9A-Z]/g, '').slice(0, MAX_SERIAL_LENGTH)
}

/**
 * Whether this could be a serial at all.
 *
 * A weak check on purpose: it filters junk out of the field, out of an OCR read
 * and out of a spreadsheet's margins, and decides nothing else. Whether the
 * number is real is settled by validateSerialNumber in serialLibrary.ts.
 *
 * The one thing asserted beyond the alphabet is that a serial carries a digit
 * somewhere. Without it a note typed into a spreadsheet cell — "not a serial",
 * "spare", "見本" — normalises to a run of letters that would import as a
 * perfectly good serial number and then match nothing for the rest of its life.
 */
export function hasValidSerialFormat(input: string): boolean {
  const serial = normaliseSerialNumber(input)
  return SERIAL_PATTERN.test(serial) && /\d/.test(serial)
}
