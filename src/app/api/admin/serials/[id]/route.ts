import { NextResponse } from 'next/server'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { can, getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import {
  productRegistration,
  serialAuditLog,
  serialNumberEntry,
  user,
  warrantyRecord,
} from '@/lib/db/schema'
import {
  SERIAL_STATUSES,
  describeChanges,
  diffFields,
  recordAudit,
} from '@/lib/serialLibrary'

const UpdateSchema = z.object({
  series: z.string().max(64).nullish(),
  modelName: z.string().max(200).nullish(),
  batch: z.string().max(120).nullish(),
  status: z.enum(SERIAL_STATUSES).optional(),
  note: z.string().max(1000).nullish(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const [serial] = await db
    .select({
      id: serialNumberEntry.id,
      serialNumber: serialNumberEntry.serialNumber,
      series: serialNumberEntry.series,
      modelName: serialNumberEntry.modelName,
      batch: serialNumberEntry.batch,
      status: serialNumberEntry.status,
      note: serialNumberEntry.note,
      registrationId: serialNumberEntry.registrationId,
      boundUserId: serialNumberEntry.boundUserId,
      boundAt: serialNumberEntry.boundAt,
      createdBy: serialNumberEntry.createdBy,
      createdAt: serialNumberEntry.createdAt,
      updatedAt: serialNumberEntry.updatedAt,
      userName: user.name,
      userEmail: user.email,
      registrationStatus: productRegistration.status,
      registrationSubmittedAt: productRegistration.submittedAt,
      installationDate: productRegistration.installationDate,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(serialNumberEntry)
    .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
    .leftJoin(productRegistration, eq(serialNumberEntry.registrationId, productRegistration.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(serialNumberEntry.id, id))
    .limit(1)

  if (!serial) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const history = await db
    .select()
    .from(serialAuditLog)
    .where(eq(serialAuditLog.serialId, id))
    .orderBy(desc(serialAuditLog.createdAt))
    .limit(100)

  return NextResponse.json({ serial, history })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const [before] = await db
    .select()
    .from(serialNumberEntry)
    .where(eq(serialNumberEntry.id, id))
    .limit(1)
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const d = parsed.data
  const patch = {
    ...(d.series !== undefined && { series: d.series?.trim() || null }),
    ...(d.modelName !== undefined && { modelName: d.modelName?.trim() || null }),
    ...(d.batch !== undefined && { batch: d.batch?.trim() || null }),
    ...(d.status !== undefined && { status: d.status }),
    ...(d.note !== undefined && { note: d.note?.trim() || null }),
  }

  // Moving a serial off BOUND by hand has to let go of the registration too,
  // or the library shows a serial that is free while still pointing at the
  // member who has it.
  const unbinding = d.status !== undefined && d.status !== 'BOUND' && before.status === 'BOUND'
  const changes = diffFields(before as unknown as Record<string, unknown>, patch)

  if (!Object.keys(changes).length) {
    return NextResponse.json({ success: true, changed: false })
  }

  await db
    .update(serialNumberEntry)
    .set({
      ...patch,
      ...(unbinding && { registrationId: null, boundUserId: null, boundAt: null }),
      updatedAt: new Date(),
    })
    .where(eq(serialNumberEntry.id, id))

  await recordAudit({
    action: 'UPDATE',
    operator: session.username,
    serialId: id,
    serialNumber: before.serialNumber,
    details:
      describeChanges(changes) +
      (unbinding ? '; released from its registration' : ''),
    changes,
  })

  return NextResponse.json({ success: true, changed: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session, 'delete')) {
    return NextResponse.json({ error: 'FORBIDDEN', permission: 'delete' }, { status: 403 })
  }
  const { id } = await params

  const [deleted] = await db
    .delete(serialNumberEntry)
    .where(eq(serialNumberEntry.id, id))
    .returning({
      serialNumber: serialNumberEntry.serialNumber,
      status: serialNumberEntry.status,
      registrationId: serialNumberEntry.registrationId,
      batch: serialNumberEntry.batch,
    })

  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // The log keeps the serial as text, so this entry survives the row it
  // describes — otherwise "who deleted it" has no answer.
  await recordAudit({
    action: 'DELETE',
    operator: session.username,
    serialId: id,
    serialNumber: deleted.serialNumber,
    details:
      `Deleted from the library (was ${deleted.status}` +
      (deleted.registrationId ? `, bound to registration ${deleted.registrationId}` : '') +
      ')',
    changes: { status: deleted.status, batch: deleted.batch, registrationId: deleted.registrationId },
  })

  return NextResponse.json({ success: true })
}
