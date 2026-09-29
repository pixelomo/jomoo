import { z } from 'zod'

/**
 * A Japanese phone number as people write it: half-width digits, hyphens
 * optional — 0120-580-999, 090-1234-5678, 0312345678. 10 or 11 digits.
 *
 * The forms used to take a country code from a dropdown and digits only; the
 * client asked for one plain field instead. The number is stored as typed.
 */
export function isJapanesePhone(value: string): boolean {
  if (!/^[\d-]+$/.test(value)) return false
  const digits = value.replace(/-/g, '').length
  return digits >= 10 && digits <= 11
}

export const PHONE_ERROR = 'phoneFormat'

export const PHONE_PLACEHOLDER = '例：0120-580-999'

export const japanesePhone = z.string().min(1).refine(isJapanesePhone, PHONE_ERROR)
