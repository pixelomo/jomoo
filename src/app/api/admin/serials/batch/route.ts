import { NextResponse } from 'next/server'
import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { can, getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialNumberEntry } from '@/lib/db/schema'
import { SERIAL_STATUSES, recordAudit } from '@/lib/serialLibrary'

/**
 * Capped so one mis-click cannot rewrite the whole library, and so the audit
 * rows written below stay a bounded insert. The table pages at 200, so this is
 * comfortably more than a full page of selections.
 */
const MAX_BATCH = 500

const BatchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('status'),
    ids: z.array(z.uuid()).min(1).max(MAX_BATCH),
    status: z.enum(SERIAL_STATUSES),
    note: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal('delete'),
    ids: z.array(z.uuid()).min(1).max(MAX_BATCH),
  }),
])

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const batchId = crypto.randomUUID()

  if (parsed.data.action === 'delete') {
    if (!can(session, 'delete')) {
      return NextResponse.json({ error: 'FORBIDDEN', permission: 'delete' }, { status: 403 })
    }

    const deleted = await db
      .delete(serialNumberEntry)
      .where(inArray(serialNumberEntry.id, parsed.data.ids))
      .returning({
        id: serialNumberEntry.id,
        serialNumber: serialNumberEntry.serialNumber,
        status: serialNumberEntry.status,
        registrationId: serialNumberEntry.registrationId,
      })

    // One row per serial, sharing a batch id: a bulk delete is exactly when
    // someone needs to know which numbers went, not just how many.
    await recordAudit(
      deleted.map((s) => ({
        action: 'DELETE' as const,
        operator: session.username,
        serialId: s.id,
        serialNumber: s.serialNumber,
        batchId,
        details:
          `Deleted in a batch of ${deleted.length} (was ${s.status}` +
          (s.registrationId ? `, bound to registration ${s.registrationId}` : '') +
          ')',
        changes: { status: s.status, registrationId: s.registrationId },
      }))
    )

    return NextResponse.json({ deleted: deleted.length, batchId })
  }

  const { ids, status, note } = parsed.data

  const before = await db
    .select({
      id: serialNumberEntry.id,
      serialNumber: serialNumberEntry.serialNumber,
      status: serialNumberEntry.status,
    })
    .from(serialNumberEntry)
    .where(inArray(serialNumberEntry.id, ids))

  const changing = before.filter((s) => s.status !== status)
  if (!changing.length) {
    return NextResponse.json({ updated: 0, batchId, message: 'Already at that status' })
  }

  // Same rule as the single-serial edit: leaving BOUND lets go of the
  // registration, so a serial is never free and claimed at the same time.
  const releasing = status !== 'BOUND'

  await db
    .update(serialNumberEntry)
    .set({
      status,
      ...(note ? { note } : {}),
      ...(releasing && { registrationId: null, boundUserId: null, boundAt: null }),
      updatedAt: new Date(),
    })
    .where(inArray(serialNumberEntry.id, changing.map((s) => s.id)))

  await recordAudit(
    changing.map((s) => ({
      action: 'UPDATE' as const,
      operator: session.username,
      serialId: s.id,
      serialNumber: s.serialNumber,
      batchId,
      details:
        `status: ${s.status} → ${status} (batch of ${changing.length})` +
        (releasing && s.status === 'BOUND' ? '; released from its registration' : '') +
        (note ? `; note: ${note}` : ''),
      changes: { status: { from: s.status, to: status } },
    }))
  )

  return NextResponse.json({ updated: changing.length, skipped: before.length - changing.length, batchId })
}
