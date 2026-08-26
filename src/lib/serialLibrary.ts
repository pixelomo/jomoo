import 'server-only'
import { and, eq, ilike, inArray, isNull, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { serialAuditLog, serialNumberEntry } from '@/lib/db/schema'
import {
  MAX_SERIAL_LENGTH,
  MIN_SERIAL_LENGTH,
  hasValidSerialFormat,
  normaliseSerialNumber,
  type SerialValidationResult,
} from '@/lib/serialValidation'
import { isSerialStatus, type SerialStatus, type AuditAction } from '@/lib/serialStatus'
import type { AdminSession } from '@/lib/admin-auth'

// The statuses live in serialStatus.ts so client components can read them too;
// re-exported here so server code has one import for the whole subject.
export {
  SERIAL_STATUSES,
  SERIAL_STATUS_META,
  isSerialStatus,
  AUDIT_ACTIONS,
  AUDIT_ACTION_META,
} from '@/lib/serialStatus'
export type { SerialStatus, AuditAction } from '@/lib/serialStatus'

// ─────────────────────────────────────────────
// Querying
// ─────────────────────────────────────────────

/**
 * Turns the list page's query string into a WHERE clause.
 *
 * Shared by the table, the CSV export and the batch endpoint's "select
 * everything matching" path, so all three always mean the same set of rows —
 * an export that quietly ignores the active filter is how the wrong list ends
 * up in someone's inbox.
 */
export function serialFilters(searchParams: URLSearchParams): SQL | undefined {
  const q = searchParams.get('q')?.trim()
  const status = searchParams.get('status')
  const batch = searchParams.get('batch')?.trim()

  const clauses: SQL[] = []
  if (isSerialStatus(status)) clauses.push(eq(serialNumberEntry.status, status))
  if (batch) clauses.push(eq(serialNumberEntry.batch, batch))
  if (q) {
    // Search the normalised form of the serial as well, so a number pasted back
    // with the dashes it was printed with still finds its row.
    const clause = or(
      ilike(serialNumberEntry.serialNumber, `%${normaliseSerialNumber(q)}%`),
      ilike(serialNumberEntry.modelName, `%${q}%`),
      ilike(serialNumberEntry.batch, `%${q}%`),
      ilike(serialNumberEntry.note, `%${q}%`)
    )
    if (clause) clauses.push(clause)
  }

  return clauses.length ? and(...clauses) : undefined
}

// ─────────────────────────────────────────────
// Audit log
// ─────────────────────────────────────────────

export interface AuditEntry {
  action: AuditAction
  operator: string
  serialId?: string | null
  serialNumber?: string | null
  details?: string | null
  changes?: Record<string, { from: unknown; to: unknown }> | Record<string, unknown> | null
  batchId?: string | null
}

/**
 * Writes the log, and never throws.
 *
 * A failed audit write must not roll back or 500 the action the admin actually
 * asked for — losing one log line is bad, losing the import is worse. The
 * failure is logged loudly so it does not pass unnoticed.
 */
export async function recordAudit(entries: AuditEntry | AuditEntry[]): Promise<void> {
  const rows = (Array.isArray(entries) ? entries : [entries]).map((e) => ({
    action: e.action,
    operator: e.operator,
    serialId: e.serialId ?? null,
    serialNumber: e.serialNumber ?? null,
    details: e.details ?? null,
    changes: e.changes ?? null,
    batchId: e.batchId ?? null,
  }))
  if (!rows.length) return

  try {
    await db.insert(serialAuditLog).values(rows)
  } catch (err) {
    console.error('[serial-audit] could not write audit entries', err, rows)
  }
}

/** Field-level diff, so the log records what actually moved and nothing else. */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {}
  for (const [key, value] of Object.entries(after)) {
    if (value === undefined) continue
    const previous = before[key]
    // null and '' both mean "empty" once a form has round-tripped a value.
    const same = previous === value || ((previous ?? '') === '' && (value ?? '') === '')
    if (!same) changes[key] = { from: previous ?? null, to: value ?? null }
  }
  return changes
}

export function describeChanges(changes: Record<string, { from: unknown; to: unknown }>): string {
  return (
    Object.entries(changes)
      .map(([field, { from, to }]) => `${field}: ${from ?? '—'} → ${to ?? '—'}`)
      .join('; ') || 'no changes'
  )
}

// ─────────────────────────────────────────────
// Import
// ─────────────────────────────────────────────

export interface ParsedSerialRow {
  serialNumber: string
  series?: string | null
  modelName?: string | null
  status?: SerialStatus
  note?: string | null
}

export interface ParseResult {
  rows: ParsedSerialRow[]
  /** Lines that could not be used, with the reason, so the admin can fix them. */
  rejected: { line: number; value: string; reason: string }[]
  /** Serials appearing more than once in the pasted text itself. */
  duplicatesInFile: string[]
}

const COLUMN_ALIASES: Record<string, keyof ParsedSerialRow> = {
  serial: 'serialNumber',
  serialnumber: 'serialNumber',
  serial_number: 'serialNumber',
  'serial number': 'serialNumber',
  'product number': 'serialNumber',
  製造番号: 'serialNumber',
  // The factory's own spreadsheets come in simplified Chinese.
  制造番号: 'serialNumber',
  产品编号: 'serialNumber',
  编号: 'serialNumber',
  series: 'series',
  シリーズ: 'series',
  系列: 'series',
  model: 'modelName',
  modelname: 'modelName',
  model_name: 'modelName',
  'model name': 'modelName',
  型番: 'modelName',
  型号: 'modelName',
  status: 'status',
  ステータス: 'status',
  状态: 'status',
  note: 'note',
  notes: 'note',
  備考: 'note',
  备注: 'note',
}

/**
 * The column a header cell names, or null.
 *
 * The factory writes its headers in two languages at once — "型番Model",
 * "制造番号Product number" — which matches no alias as a whole. Each half is
 * tried on its own before giving up, so those sheets import as they arrive.
 */
function columnFor(cell: string): keyof ParsedSerialRow | null {
  const direct = COLUMN_ALIASES[cell.toLowerCase()]
  if (direct) return direct

  const cjk = cell.replace(/[\x00-\x7F]/g, '').trim()
  const ascii = cell.replace(/[^\x00-\x7F]/g, '').trim().toLowerCase()
  return COLUMN_ALIASES[cjk] ?? COLUMN_ALIASES[ascii] ?? null
}

/**
 * Splits one CSV line, honouring quoted fields.
 *
 * Written out rather than pulled in as a dependency because the input is a
 * factory spreadsheet: a model name containing a comma is routine, and
 * splitting on commas alone silently shifts every later column.
 */
function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') { cell += '"'; i++ }
        else quoted = false
      } else cell += char
    } else if (char === '"') {
      quoted = true
    } else if (char === ',' || char === '\t') {
      cells.push(cell)
      cell = ''
    } else cell += char
  }
  cells.push(cell)
  return cells.map((c) => c.trim())
}

/**
 * Accepts either a bare list of serials, one per line, or a CSV with a header
 * row naming the columns. The factory sends both, and asking staff to reshape
 * a delivery note before importing it is how serials end up being retyped.
 *
 * Serials of any length and any mixture of letters and digits are accepted, so
 * a single file can hold every product in a delivery — a 19-character X40
 * beside a 20-character cabinet — without anyone sorting it first. This file is
 * what defines a valid serial; nothing here second-guesses the factory.
 */
export function parseSerialImport(
  input: string,
  defaults: { series?: string | null; modelName?: string | null; status?: SerialStatus } = {}
): ParseResult {
  // Excel writes a byte order mark when it saves "CSV UTF-8", and so does this
  // app's own export. It is invisible in the file but it sticks to the first
  // header cell, which would stop the header being recognised as one — and the
  // whole header line would then be read as a serial and rejected.
  const lines = input.replace(/^\uFEFF/, '').split(/\r?\n/)
  const rows: ParsedSerialRow[] = []
  const rejected: ParseResult['rejected'] = []
  const duplicatesInFile: string[] = []
  const seen = new Set<string>()

  // A header is any first row with a cell that names the serial column —
  // wherever it sits. The factory's sheets lead with 品类 or a model, so
  // insisting the serial come first meant reading their category column as a
  // list of serial numbers. Columns we do not recognise are ignored, so the
  // extra ones those sheets carry cost nothing.
  //
  // A file that starts straight in on data keeps its first row: that row would
  // have to contain a cell reading exactly "serial", "製造番号" or the like
  // before it could be mistaken for a header.
  let columns: (keyof ParsedSerialRow | null)[] | null = null
  const firstFilled = lines.findIndex((l) => l.trim())
  if (firstFilled >= 0) {
    const cells = splitCsvLine(lines[firstFilled])
    const mapped = cells.map(columnFor)
    if (mapped.includes('serialNumber')) columns = mapped
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return
    if (columns && index === firstFilled) return // the header itself
    if (line.startsWith('#')) return

    const cells = splitCsvLine(line)
    const row: ParsedSerialRow = {
      serialNumber: '',
      series: defaults.series ?? null,
      modelName: defaults.modelName ?? null,
      status: defaults.status ?? 'UNUSED',
      note: null,
    }

    if (columns) {
      columns.forEach((field, i) => {
        const value = cells[i]
        if (!field || !value) return
        if (field === 'status') {
          const upper = value.toUpperCase()
          if (isSerialStatus(upper)) row.status = upper
        } else {
          row[field] = value as never
        }
      })
    } else {
      row.serialNumber = cells[0]
    }

    const serial = normaliseSerialNumber(row.serialNumber ?? '')
    if (!serial) {
      rejected.push({ line: index + 1, value: line, reason: 'No serial number in this row' })
      return
    }
    // No length or prefix rule: this file is the definition of what a valid
    // serial is, so anything the factory sends is taken as issued. The only
    // rows turned away are ones that could not be a serial at all — a stray
    // note in the margin, a merged cell, a column of dates.
    if (!hasValidSerialFormat(serial)) {
      rejected.push({
        line: index + 1,
        // What is actually in the file, not the normalised form — "NOT A
        // SERIAL" is not something anyone can search their spreadsheet for.
        value: row.serialNumber || line,
        reason: `Not a serial number — expected ${MIN_SERIAL_LENGTH}–${MAX_SERIAL_LENGTH} letters and digits`,
      })
      return
    }
    if (seen.has(serial)) {
      duplicatesInFile.push(serial)
      return
    }

    seen.add(serial)
    rows.push({ ...row, serialNumber: serial })
  })

  return { rows, rejected, duplicatesInFile }
}

export interface ImportOutcome {
  imported: number
  /** Already in the library — left exactly as they were. */
  skipped: number
  rejected: ParseResult['rejected']
  duplicatesInFile: string[]
  batchId: string
}

/**
 * Adds every new serial and leaves existing ones untouched.
 *
 * Re-importing the same delivery note is a normal thing for staff to do when
 * they are unsure whether the first attempt worked, so it has to be harmless:
 * an existing serial is reported as skipped rather than overwritten, which
 * would wipe the binding on one a member has already registered.
 */
export async function importSerials(
  parsed: ParseResult,
  meta: { batch?: string | null; operator: string }
): Promise<ImportOutcome> {
  const batchId = crypto.randomUUID()

  if (!parsed.rows.length) {
    return {
      imported: 0,
      skipped: 0,
      rejected: parsed.rejected,
      duplicatesInFile: parsed.duplicatesInFile,
      batchId,
    }
  }

  const inserted = await db
    .insert(serialNumberEntry)
    .values(
      parsed.rows.map((row) => ({
        serialNumber: row.serialNumber,
        series: row.series ?? null,
        modelName: row.modelName ?? null,
        batch: meta.batch?.trim() || null,
        status: row.status ?? 'UNUSED',
        note: row.note ?? null,
        createdBy: meta.operator,
      }))
    )
    .onConflictDoNothing({ target: serialNumberEntry.serialNumber })
    .returning({ id: serialNumberEntry.id })

  const imported = inserted.length
  const skipped = parsed.rows.length - imported

  // One summary row rather than one per serial: an import of ten thousand
  // serials would otherwise bury every other entry in the log, and each row
  // already records its own batch, importer and timestamp.
  await recordAudit({
    action: 'IMPORT',
    operator: meta.operator,
    batchId,
    details:
      `Imported ${imported} serial${imported === 1 ? '' : 's'}` +
      (meta.batch ? ` into batch "${meta.batch}"` : '') +
      (skipped ? `, ${skipped} already in the library` : '') +
      (parsed.rejected.length ? `, ${parsed.rejected.length} rejected` : ''),
    changes: {
      imported,
      skipped,
      rejected: parsed.rejected.length,
      duplicatesInFile: parsed.duplicatesInFile.length,
      batch: meta.batch ?? null,
    },
  })

  return {
    imported,
    skipped,
    rejected: parsed.rejected,
    duplicatesInFile: parsed.duplicatesInFile,
    batchId,
  }
}

// ─────────────────────────────────────────────
// Binding to registrations
// ─────────────────────────────────────────────

/** Statuses the library refuses to let a member register against. */
const BLOCKED_STATUSES = new Set<SerialStatus>(['REVOKED', 'ABNORMAL'])

/**
 * Whether this serial is one the factory actually issued.
 *
 * This is the check the whole registration turns on, and it is a lookup, not a
 * pattern: the imported library is the list of real numbers, so a serial is
 * valid when it is in there and refused when it is not.
 *
 * The empty library is the one case that has to stay open. Until the first
 * batch is imported there is nothing to check against, and refusing every
 * member until then would close registration entirely — so an empty library
 * accepts, and the moment a single serial is imported the check has teeth.
 * That flip is deliberate and it is worth knowing about before the first
 * import: half a batch in the library means the other half is refused.
 *
 * Never throws. A database failure must not decide that a good serial is fake,
 * so it reports service_unavailable and the registration is flagged for a
 * person rather than being auto-approved or auto-rejected.
 */
export async function validateSerialNumber(
  serialNumber: string
): Promise<SerialValidationResult> {
  const serial = normaliseSerialNumber(serialNumber)

  if (!hasValidSerialFormat(serial)) {
    return { valid: false, reason: 'invalid_format' }
  }

  try {
    const [row] = await db
      .select({ status: serialNumberEntry.status })
      .from(serialNumberEntry)
      .where(eq(serialNumberEntry.serialNumber, serial))
      .limit(1)

    if (row) {
      if (isSerialStatus(row.status) && BLOCKED_STATUSES.has(row.status)) {
        return { valid: false, reason: row.status === 'REVOKED' ? 'revoked' : 'abnormal' }
      }
      return { valid: true, reason: 'verified' }
    }

    // Only the miss pays for this second query, and only to tell "we have no
    // list yet" apart from "this is not on the list".
    const [any] = await db
      .select({ id: serialNumberEntry.id })
      .from(serialNumberEntry)
      .limit(1)

    return any ? { valid: false, reason: 'not_found' } : { valid: true, reason: 'library_empty' }
  } catch (err) {
    console.error('[serial-library] could not check the serial', serial, err)
    return { valid: false, reason: 'service_unavailable' }
  }
}

/**
 * Which of these serials the library has heard of.
 *
 * One query for the whole set — an OCR read offers a handful of candidates and
 * asking about each in turn would be a round trip per guess. Returns an empty
 * set on failure: not knowing is the same as no confirmation, and OCR ranking
 * is a convenience that must never take the page down with it.
 */
export async function findKnownSerials(serialNumbers: string[]): Promise<Set<string>> {
  const serials = [...new Set(serialNumbers.map(normaliseSerialNumber).filter(Boolean))]
  if (!serials.length) return new Set()

  try {
    const rows = await db
      .select({ serialNumber: serialNumberEntry.serialNumber })
      .from(serialNumberEntry)
      .where(inArray(serialNumberEntry.serialNumber, serials))
    return new Set(rows.map((r) => r.serialNumber))
  } catch (err) {
    console.error('[serial-library] could not look up OCR candidates', err)
    return new Set()
  }
}

/**
 * Marks a serial as bound when a member registers it.
 *
 * Best effort by design: the library may be empty (nothing has been imported
 * yet), and a member whose serial is not in it is still allowed through and
 * flagged. Nothing here may fail a registration that already succeeded, so
 * every path swallows its errors after logging them.
 *
 * Only UNUSED serials are claimed. A REVOKED or ABNORMAL one keeps its status
 * so the flag survives for the reviewer to see.
 */
export async function bindSerialToRegistration({
  serialNumber,
  registrationId,
  userId,
}: {
  serialNumber: string
  registrationId: string
  userId: string
}): Promise<void> {
  const serial = normaliseSerialNumber(serialNumber)

  try {
    const [bound] = await db
      .update(serialNumberEntry)
      .set({
        status: 'BOUND',
        registrationId,
        boundUserId: userId,
        boundAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(serialNumberEntry.serialNumber, serial),
          eq(serialNumberEntry.status, 'UNUSED'),
          isNull(serialNumberEntry.registrationId)
        )
      )
      .returning({ id: serialNumberEntry.id })

    if (!bound) return

    await recordAudit({
      action: 'BIND',
      operator: 'system',
      serialId: bound.id,
      serialNumber: serial,
      details: `Bound to registration ${registrationId}`,
      changes: { status: { from: 'UNUSED', to: 'BOUND' }, registrationId: { from: null, to: registrationId } },
    })
  } catch (err) {
    console.error('[serial-library] could not bind serial', serial, err)
  }
}

/**
 * Returns bound serials to UNUSED — used when the thing they were bound to is
 * deleted, so the physical product can be registered again rather than being
 * stranded as BOUND to a registration that no longer exists.
 */
export async function releaseSerialsForUsers(userIds: string[], operator: string): Promise<void> {
  if (!userIds.length) return

  try {
    const released = await db
      .update(serialNumberEntry)
      .set({
        status: 'UNUSED',
        registrationId: null,
        boundUserId: null,
        boundAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(serialNumberEntry.boundUserId, userIds),
          eq(serialNumberEntry.status, 'BOUND')
        )
      )
      .returning({ id: serialNumberEntry.id, serialNumber: serialNumberEntry.serialNumber })

    await recordAudit(
      released.map((s) => ({
        action: 'UNBIND' as const,
        operator,
        serialId: s.id,
        serialNumber: s.serialNumber,
        details: 'Released — the member it was bound to was deleted',
        changes: { status: { from: 'BOUND', to: 'UNUSED' } },
      }))
    )
  } catch (err) {
    console.error('[serial-library] could not release serials', err)
  }
}

/** Convenience for routes that have a session in hand. */
export const operatorOf = (session: AdminSession) => session.username
