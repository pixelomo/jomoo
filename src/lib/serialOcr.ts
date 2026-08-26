/**
 * Turning OCR output into serial number candidates.
 *
 * This used to lean on the format: a serial was "J" followed by digits, so an
 * eleven-character alphabet made a near-miss recoverable — an O could only ever
 * have been a 0. That is gone. Serials carry letters part way through
 * (J2339391200000HE1110), so there is no position where a letter is certainly
 * a misread digit, and "correcting" one now destroys a good read.
 *
 * What replaces it is the imported serial library. This module pulls every run
 * of letters and digits that could be a serial out of the text and ranks them
 * on shape alone; the route then asks the library which of them actually exist
 * and puts those first. A confirmed hit is worth more than any amount of
 * guessing at character shapes.
 *
 * Pure, and free of the Cloudinary client, so the ranking can be tested against
 * real misreads without a network call.
 */

import { hasValidSerialFormat, normaliseSerialNumber } from '@/lib/serialValidation'

export interface SerialCandidate {
  serialNumber: string
  /**
   * 'known'    — this exact number is in the imported serial library. Only the
   *              route can set this; the text alone cannot say it.
   * 'likely'   — shaped like a serial: opens with a letter, carries digits, and
   *              is long enough not to be the model number on the same label.
   * 'possible' — in range, but nothing else recommends it.
   */
  confidence: 'known' | 'likely' | 'possible'
}

const RANK: Record<SerialCandidate['confidence'], number> = {
  known: 0,
  likely: 1,
  possible: 2,
}

/**
 * Shortest run still taken as a serial rather than as the model number beside
 * it — "760001-TH-1CAB" reads as twelve characters and would otherwise outrank
 * the number we are after. Only affects the order candidates are offered in;
 * nothing in range is discarded.
 */
const LIKELY_MIN_LENGTH = 15

function shapeOf(run: string): SerialCandidate['confidence'] {
  const opensWithLetter = run[0] >= 'A' && run[0] <= 'Z'
  const carriesDigits = /\d/.test(run)
  return opensWithLetter && carriesDigits && run.length >= LIKELY_MIN_LENGTH ? 'likely' : 'possible'
}

/**
 * Every serial the text could be, best first.
 *
 * Nothing is corrected and nothing is assumed — a candidate is a run of
 * characters that was actually read. The member confirms it, and 照合 decides.
 */
export function extractSerialCandidates(text: string): SerialCandidate[] {
  if (!text) return []

  const tokens = text
    .split(/[\s\n\r]+/)
    .map((t) => normaliseSerialNumber(t))
    .filter(Boolean)

  /** Whether the run was read as one piece, or only appeared once two were glued. */
  const found = new Map<string, { candidate: SerialCandidate; joined: boolean }>()

  const collect = (haystack: string, joined: boolean) => {
    for (const run of haystack.match(/[0-9A-Z]+/g) ?? []) {
      if (!hasValidSerialFormat(run)) continue
      const entry = { candidate: { serialNumber: run, confidence: shapeOf(run) }, joined }
      const existing = found.get(run)
      // Seen as one piece anywhere beats seen only across a join.
      if (!existing || (existing.joined && !joined)) found.set(run, entry)
    }
  }

  for (const token of tokens) collect(token, false)
  // Adjacent pairs as well: a serial is routinely broken across lines by the
  // label's width, and gluing the two halves is the only way to recover it.
  for (let i = 0; i < tokens.length - 1; i++) collect(tokens[i] + tokens[i + 1], true)

  return [...found.values()]
    .sort(
      (a, b) =>
        RANK[a.candidate.confidence] - RANK[b.candidate.confidence] ||
        // A run that was printed as one piece before anything glued a
        // neighbouring word or date onto it.
        Number(a.joined) - Number(b.joined) ||
        // Then the longer, as more likely to be the whole number than a piece.
        b.candidate.serialNumber.length - a.candidate.serialNumber.length ||
        a.candidate.serialNumber.localeCompare(b.candidate.serialNumber)
    )
    .map((e) => e.candidate)
}

/** The single best reading, or null when nothing in the text could be a serial. */
export function bestSerialCandidate(text: string): SerialCandidate | null {
  return extractSerialCandidates(text)[0] ?? null
}
