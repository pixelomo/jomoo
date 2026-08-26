import 'server-only'
import { and, eq, ilike, inArray, isNull, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { serialAuditLog, serialNumberEntry } from '@/lib/db/schema'
import {
  KNOWN_SERIAL_DIGITS_LABEL,
  hasKnownSerialFormat,
  normaliseSerialNumber,
  serialDigitsFor,
  serialPatternFor,
  seriesFromSerialLength,
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
  製造番号: 'serialNumber',
  series: 'series',
  シリーズ: 'series',
  model: 'modelName',
  modelname: 'modelName',
  model_name: 'modelName',
  'model name': 'modelName',
  型番: 'modelName',
  status: 'status',
  ステータス: 'status',
  note: 'note',
  notes: 'note',
  備考: 'note',
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
 * A row that names its series is checked against that product's digit count.
 * One that does not — the usual case for a plain list — is accepted at any
 * length the catalogue uses, so serials for different products of different
 * lengths import together from a single file, and the series is inferred from
 * the length wherever only one product has it.
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

  // A header is only a header if its first cell names a serial column — a file
  // that starts straight in on data must not lose its first serial.
  let columns: (keyof ParsedSerialRow | null)[] | null = null
  const firstFilled = lines.findIndex((l) => l.trim())
  if (firstFilled >= 0) {
    const cells = splitCsvLine(lines[firstFilled])
    const mapped = cells.map((c) => COLUMN_ALIASES[c.toLowerCase()] ?? null)
    if (mapped[0] === 'serialNumber') columns = mapped
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
    // With a series named — by the row's own column or by the import form — the
    // serial has to match that product's length exactly. Without one, any
    // length the catalogue uses is accepted, so a delivery note holding a
    // 20-digit shower set and a 19-digit toilet imports in a single pass; the
    // series is then filled in from the length where that is unambiguous.
    if (row.series) {
      if (!serialPatternFor(row.series).test(serial)) {
        rejected.push({
          line: index + 1,
          // What is actually in the file, not the normalised form — "NOTASERIAL"
          // is not something anyone can search their spreadsheet for.
          value: row.serialNumber || line,
          reason: `Expected J followed by ${serialDigitsFor(row.series)} digits (${row.series})`,
        })
        return
      }
    } else {
      if (!hasKnownSerialFormat(serial)) {
        rejected.push({
          line: index + 1,
          value: row.serialNumber || line,
          reason: `Expected J followed by ${KNOWN_SERIAL_DIGITS_LABEL} digits`,
        })
        return
      }
      row.series = seriesFromSerialLength(serial)
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
 * Why the library will not accept this serial, or null if it has no objection.
 *
 * Returns null for a serial the library has never heard of: until the factory's
 * numbers are imported the library is empty, and an unknown serial is still
 * accepted on format alone. Only a number that is *in* the library and marked
 * REVOKED or ABNORMAL is refused — that flag was put there by a person, and
 * letting a warranty through on it would erase their decision.
 *
 * Never throws. A database failure must not block a member from registering a
 * perfectly good product, so it falls through to "no objection" and logs.
 */
export async function serialLibraryObjection(
  serialNumber: string
): Promise<'revoked' | 'abnormal' | null> {
  try {
    const [row] = await db
      .select({ status: serialNumberEntry.status })
      .from(serialNumberEntry)
      .where(eq(serialNumberEntry.serialNumber, normaliseSerialNumber(serialNumber)))
      .limit(1)

    if (!row || !isSerialStatus(row.status) || !BLOCKED_STATUSES.has(row.status)) return null
    return row.status === 'REVOKED' ? 'revoked' : 'abnormal'
  } catch (err) {
    console.error('[serial-library] could not check the serial, allowing it through', err)
    return null
  }
}

/**
 * Marks a serial as bound when a member registers it.
 *
 * Best effort by design: the library may be empty (nothing has been imported
 * yet) and a member registering an unknown serial is still allowed through on
 * format alone. Nothing here may fail a registration that already succeeded, so
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
