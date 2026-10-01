/**
 * The 市区町村 at the front of a Japanese street address.
 *
 * Product registrations hold the prefecture in its own field and everything
 * after it as one free-text line (市区町村・番地・建物名), so the city is read
 * off the front of that line: a 政令市's ward (横浜市中区), a county town
 * (西多摩郡瑞穂町), or a plain 市・区・町・村. A prefecture typed into the line
 * as well is skipped. Returns null when the line does not start with one —
 * better an empty cell than a street name passed off as a city.
 */
const PREFECTURE = /^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)/
const CITY = /^(.+?郡.+?[町村]|.+?市.+?区|.+?[市区町村])/

export function cityFromAddress(detail: string | null | undefined): string | null {
  if (!detail) return null
  const line = detail.normalize('NFKC').trim().replace(PREFECTURE, '').trim()
  return line.match(CITY)?.[1] ?? null
}
