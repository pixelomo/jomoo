/**
 * How long a warranty runs.
 *
 * Every product carries the standard 2 years from its 設置 / 引渡日 — the date
 * the certificate calls お引き渡し日. Registering within 3 months of that date
 * adds the JOMOO Club's 3-year extension, for 5 years in all; registering later
 * still records the product, but the warranty stays at the standard 2 years.
 *
 * Kept in one place because the registration route needs the answer twice —
 * once for the record and once for the email — and the terms on the warranty
 * page promise the same numbers.
 */
export const STANDARD_WARRANTY_YEARS = 2
export const EXTENSION_YEARS = 3
/** Months after the 設置 / 引渡日 within which registering earns the extension. */
export const EXTENSION_WINDOW_MONTHS = 3

/** Parses a YYYY-MM-DD as a calendar date in UTC, so no timezone shifts it a day. */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Adds whole months, clamping to the last day of the target month — so the
 * 30 November window closes on 28/29 February, not in early March.
 */
function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + months
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(date.getUTCDate(), lastDay)))
}

const toDay = (date: Date) => date.toISOString().split('T')[0]

/** Today as YYYY-MM-DD in Japan, which is the calendar a member registers in. */
function todayInJapan(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now)
}

export interface WarrantyTerm {
  /** Expiry as a plain YYYY-MM-DD date, which is how the column stores it. */
  expiryDate: string
  /** True when the registration landed inside the window and earned +3 years. */
  extended: boolean
  years: number
}

/**
 * The warranty a registration earns: 5 years from the 設置 / 引渡日 when it is
 * registered within 3 months of that date (the last day of the window counts),
 * otherwise the standard 2.
 */
export function warrantyTermFor(installationDate: string, registeredAt: Date = new Date()): WarrantyTerm {
  const start = parseDay(installationDate)
  const windowEnd = toDay(addMonths(start, EXTENSION_WINDOW_MONTHS))
  const extended = todayInJapan(registeredAt) <= windowEnd
  const years = STANDARD_WARRANTY_YEARS + (extended ? EXTENSION_YEARS : 0)

  return { expiryDate: toDay(addMonths(start, years * 12)), extended, years }
}
