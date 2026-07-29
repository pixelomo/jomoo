/**
 * Reads the client's X40 spec workbook and emits the grouped spec table for each
 * model as JSON, ready for scripts/seed-product-content.mjs.
 *
 * Sheet 1 is a merged-cell layout: column A is the group, B the subgroup, C the
 * row label, D the X40-B value and E the X40-C value — but any of A/B/C can be
 * merged across rows or across each other, so merges are expanded before the
 * hierarchy is read off.
 *
 * Usage: node scripts/extract-x40-specs.mjs <path-to-xlsx> [out.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

const SRC = process.argv[2]
const OUT = process.argv[3] ?? 'scripts/x40-specs.json'
if (!SRC) {
  console.error('usage: node scripts/extract-x40-specs.mjs <xlsx> [out.json]')
  process.exit(1)
}

/* ── minimal zip reader (xlsx is a zip; avoids a dependency) ── */
function unzip(buf) {
  const files = {}
  // Walk the central directory from the End Of Central Directory record.
  let eocd = buf.length - 22
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)

  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localOff = buf.readUInt32LE(p + 42)
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8')

    const lNameLen = buf.readUInt16LE(localOff + 26)
    const lExtraLen = buf.readUInt16LE(localOff + 28)
    const dataStart = localOff + 30 + lNameLen + lExtraLen
    const method = buf.readUInt16LE(localOff + 8)
    const compSize = buf.readUInt32LE(p + 20)

    const raw = buf.subarray(dataStart, dataStart + compSize)
    files[name] = method === 0 ? raw : inflateRawSync(raw)
    p += 46 + nameLen + extraLen + commentLen
  }
  return files
}

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

const files = unzip(readFileSync(SRC))
const xml = (name) => files[name].toString('utf8')

/* ── shared strings ── */
const sharedStrings = [...xml('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
  ([, si]) => [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(([, t]) => decodeEntities(t)).join('')
)

/* ── cells ── */
const sheet = xml('xl/worksheets/sheet1.xml')
const cells = new Map()
// `(\/>|>…<\/c>)` matters: an empty cell is written `<c r="A38" s="20"/>`, and
// treating it as an open tag makes the body match run on into the next cell.
for (const [, ref, attrs, , body] of sheet.matchAll(
  /<c r="([A-Z]+\d+)"([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g
)) {
  if (!body) continue
  const v = /<v>([\s\S]*?)<\/v>/.exec(body)
  if (!v) continue
  const value = /t="s"/.test(attrs) ? sharedStrings[Number(v[1])] : decodeEntities(v[1])
  // Excel writes in-cell breaks as CRLF; the template renders on \n.
  if (value?.trim()) cells.set(ref, value.trim().replace(/\r\n?/g, '\n'))
}

/* ── expand merges so every covered cell carries the anchor's value ── */
const colNum = (c) => [...c].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0)
const colName = (n) => {
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = (n - 1 - r) / 26
  }
  return s
}
const split = (ref) => {
  const [, c, r] = /^([A-Z]+)(\d+)$/.exec(ref)
  return { col: colNum(c), row: Number(r) }
}

for (const [, ref] of sheet.matchAll(/<mergeCell ref="([^"]+)"\/>/g)) {
  const [from, to] = ref.split(':')
  const a = split(from)
  const b = split(to)
  const value = cells.get(from)
  if (!value) continue
  for (let r = a.row; r <= b.row; r++) {
    for (let c = a.col; c <= b.col; c++) {
      cells.set(`${colName(c)}${r}`, value)
    }
  }
}

/**
 * The workbook is laid out for print, so headings carry line breaks from narrow
 * columns, and a few characters were typed in Chinese on an otherwise Japanese
 * sheet. Cleaned here rather than in the CMS so a re-export stays reproducible.
 */
const CHAR_FIXES = [
  [/额/g, '額'], // 额定消費電力 → 額定消費電力
  [/约/g, '約'], // 约230ml → 約230ml (the sheet uses 約 elsewhere)
]

const cleanHeading = (s) => {
  let out = s.replace(/\n/g, '').replace(/[｜|]\s*$/, '').trim()
  for (const [from, to] of CHAR_FIXES) out = out.replace(from, to)
  return out
}

const cleanValue = (s) => {
  let out = s.trim()
  for (const [from, to] of CHAR_FIXES) out = out.replace(from, to)
  return out
}

/** A lone slash means "this model does not have it" — drop the row entirely. */
const NOT_APPLICABLE = /^[/／]$/

const at = (col, row) => cells.get(`${col}${row}`) ?? ''

/* ── read the hierarchy ──
   Column A is a group heading only when it spans a B/C hierarchy below it;
   for the top rows A is merged across A:C and is simply the row label. */
const MODELS = [
  { slug: 'x40-b', col: 'D' },
  { slug: 'x40-c', col: 'E' },
]

const FIRST_ROW = 5 // row 3 is the series name, row 4 the grade — both headers
const LAST_ROW = 39
const NOTE_ROW = 40

const out = {}
for (const { slug, col } of MODELS) {
  const groups = []
  let lastSignature = ''

  for (let row = FIRST_ROW; row <= LAST_ROW; row++) {
    const value = cleanValue(at(col, row))
    if (!value || NOT_APPLICABLE.test(value)) continue

    const a = cleanHeading(at('A', row))
    const b = cleanHeading(at('B', row))
    const c = cleanHeading(at('C', row))

    // When A, B and C all hold the same merged string the row has no hierarchy,
    // so A is the label. Otherwise the deepest distinct cell is the label and
    // whatever sits above it is group / subgroup.
    let groupTitle = ''
    let subgroup = ''
    let label = ''

    if (c && c !== b && c !== a) {
      label = c
      if (b && b !== a) {
        // A > B > C — a full three-level row.
        subgroup = b
        groupTitle = a
      } else {
        // A merged across A:B (e.g. 給水圧力 spanning its two pressure rows),
        // so A is the subgroup and there is no outer group.
        subgroup = a
        groupTitle = ''
      }
    } else if (b && b !== a) {
      label = b
      groupTitle = a
    } else {
      label = a
    }

    if (!label) continue

    // Skip the duplicated second half of a vertically merged logical row.
    const signature = `${groupTitle}|${subgroup}|${label}|${value}`
    if (signature === lastSignature) continue
    lastSignature = signature

    let group = groups.at(-1)
    if (!group || group.title !== groupTitle) {
      group = { title: groupTitle, rows: [] }
      groups.push(group)
    }
    // 'モコン' under the リモコン group is a truncated repeat of the heading.
    if (subgroup && groupTitle.includes(subgroup)) subgroup = ''

    group.rows.push(subgroup ? { subgroup, label, value } : { label, value })
  }

  out[slug] = { specGroups: groups, specNote: at('D', NOTE_ROW) }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

for (const [slug, { specGroups, specNote }] of Object.entries(out)) {
  const rows = specGroups.reduce((n, g) => n + g.rows.length, 0)
  console.log(`${slug}: ${specGroups.length} groups, ${rows} rows${specNote ? ', + note' : ''}`)
  for (const g of specGroups) console.log(`   ${g.title || '(no heading)'} — ${g.rows.length} rows`)
}
console.log(`\nwritten to ${OUT}`)
