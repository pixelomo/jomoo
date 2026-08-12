/**
 * Turning OCR output into serial number candidates.
 *
 * The format does the heavy lifting: a JOMOO serial is "J" followed by 19 or 20
 * digits and nothing else, so the alphabet is eleven characters. That means a
 * read only has to be *close* — the corrections below recover the handful of
 * shapes an OCR engine reliably confuses, and serialValidation.ts then decides
 * whether the result is actually a serial.
 *
 * Pure, and free of the Cloudinary client, so the ranking can be tested against
 * real misreads without a network call.
 */

import { normaliseSerialNumber, serialDigitsFor } from '@/lib/serialValidation'

/**
 * Letters an OCR engine returns where a digit was printed. Only the tail of the
 * serial is corrected — the leading J is the one position that is genuinely a
 * letter, so rewriting it would turn a good read into a bad one.
 */
const LOOKALIKE_DIGITS: Record<string, string> = {
  O: '0', Q: '0', D: '0',
  I: '1', L: '1', '|': '1', '!': '1',
  Z: '2',
  E: '3',
  A: '4',
  S: '5',
  G: '6',
  T: '7',
  B: '8',
}

/** Characters that could be a misread leading J. */
const LOOKALIKE_J = new Set(['J', ']', '}', ')', '1', '7', 'I', 'T'])

export interface SerialCandidate {
  serialNumber: string
  /**
   * 'exact'      — read as J + digits with nothing corrected.
   * 'corrected'  — one or more lookalike letters mapped to digits.
   * 'prefixed'   — the digits were right but the leading J had to be assumed.
   */
  confidence: 'exact' | 'corrected' | 'prefixed'
  /** How many characters had to be changed to reach a valid serial. */
  corrections: number
}

const RANK: Record<SerialCandidate['confidence'], number> = {
  exact: 0,
  corrected: 1,
  prefixed: 2,
}

function correctTail(tail: string): { digits: string; corrections: number } | null {
  let corrections = 0
  let digits = ''
  for (const char of tail) {
    if (char >= '0' && char <= '9') {
      digits += char
      continue
    }
    const mapped = LOOKALIKE_DIGITS[char]
    if (!mapped) return null
    digits += mapped
    corrections++
  }
  return { digits, corrections }
}

/**
 * Every serial the text could be, best first.
 *
 * `series` picks the expected digit count; without it both known lengths are
 * tried, because at capture time the member has already chosen their model but
 * a caller may not have it to hand.
 */
export function extractSerialCandidates(
  text: string,
  series?: string | null
): SerialCandidate[] {
  if (!text) return []

  const lengths = series
    ? [serialDigitsFor(series)]
    : [...new Set([serialDigitsFor(null), 19, 20])]

  // Normalise per token, then also as one run: a serial is routinely broken
  // across lines by the label's width, and joining recovers it.
  const tokens = text
    .split(/[\s\n\r]+/)
    .map((t) => normaliseSerialNumber(t))
    .filter(Boolean)

  const haystacks = new Set<string>(tokens)
  for (let i = 0; i < tokens.length - 1; i++) {
    haystacks.add(tokens[i] + tokens[i + 1])
  }
  haystacks.add(tokens.join(''))

  const found = new Map<string, SerialCandidate>()

  const record = (candidate: SerialCandidate) => {
    const existing = found.get(candidate.serialNumber)
    // Keep the cleanest reading of any given serial.
    if (
      !existing ||
      RANK[candidate.confidence] < RANK[existing.confidence] ||
      (candidate.confidence === existing.confidence &&
        candidate.corrections < existing.corrections)
    ) {
      found.set(candidate.serialNumber, candidate)
    }
  }

  for (const haystack of haystacks) {
    for (const length of lengths) {
      const window = length + 1
      for (let i = 0; i + window <= haystack.length; i++) {
        const slice = haystack.slice(i, i + window)
        const head = slice[0]
        const tail = slice.slice(1)

        if (LOOKALIKE_J.has(head)) {
          const corrected = correctTail(tail)
          if (corrected && corrected.digits.length === length) {
            const isExactHead = head === 'J'
            record({
              serialNumber: `J${corrected.digits}`,
              confidence:
                isExactHead && corrected.corrections === 0
                  ? 'exact'
                  : isExactHead
                    ? 'corrected'
                    : 'prefixed',
              corrections: corrected.corrections + (isExactHead ? 0 : 1),
            })
          }
        }
      }

      // A run of exactly the right length with no J in front at all — the
      // prefix is often stamped separately and missed entirely.
      for (let i = 0; i + length <= haystack.length; i++) {
        const before = i === 0 ? '' : haystack[i - 1]
        if (before === 'J') continue // already covered above
        const corrected = correctTail(haystack.slice(i, i + length))
        if (corrected && corrected.digits.length === length) {
          record({
            serialNumber: `J${corrected.digits}`,
            confidence: 'prefixed',
            corrections: corrected.corrections + 1,
          })
        }
      }
    }
  }

  return [...found.values()].sort(
    (a, b) => RANK[a.confidence] - RANK[b.confidence] || a.corrections - b.corrections
  )
}

/** The single best reading, or null when nothing in the text could be a serial. */
export function bestSerialCandidate(
  text: string,
  series?: string | null
): SerialCandidate | null {
  return extractSerialCandidates(text, series)[0] ?? null
}
