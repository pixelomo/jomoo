import { NextResponse } from 'next/server'
import { z } from 'zod'
import { desc, eq, sql } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialNumberEntry, user } from '@/lib/db/schema'
import { hasValidSerialFormat, normaliseSerialNumber } from '@/lib/serialValidation'
import { SERIAL_STATUSES, recordAudit, serialFilters } from '@/lib/serialLibrary'

const CreateSchema = z.object({
  serialNumber: z.string().min(1).max(64),
  series: z.string().max(64).nullish(),
  modelName: z.string().max(200).nullish(),
  batch: z.string().max(120).nullish(),
  status: z.enum(SERIAL_STATUSES).default('UNUSED'),
  note: z.string().max(1000).nullish(),
})

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10)))
  const where = serialFilters(searchParams)

  const rows = await db
    .select({
      id: serialNumberEntry.id,
      serialNumber: serialNumberEntry.serialNumber,
      series: serialNumberEntry.series,
      modelName: serialNumberEntry.modelName,
      batch: serialNumberEntry.batch,
      status: serialNumberEntry.status,
      note: serialNumberEntry.note,
      registrationId: serialNumberEntry.registrationId,
      boundAt: serialNumberEntry.boundAt,
      boundUserName: user.name,
      boundUserEmail: user.email,
      createdAt: serialNumberEntry.createdAt,
    })
    .from(serialNumberEntry)
    .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
    .where(where)
    .orderBy(desc(serialNumberEntry.createdAt))
    .limit(limit)
    .offset((page - 1) * limit)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(serialNumberEntry)
    .where(where)

  return NextResponse.json({ serials: rows, total, page, limit })
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const serial = normaliseSerialNumber(data.serialNumber)
  // Adding a serial by hand is the same act as importing one: this is the
  // library saying which numbers exist, so nothing is turned away for its
  // length or its prefix — only for not being a serial at all.
  if (!hasValidSerialFormat(serial)) {
    return NextResponse.json({ error: 'INVALID_FORMAT' }, { status: 422 })
  }

  // onConflictDoNothing rather than a lookup-then-insert: two admins adding the
  // same serial at once would slip past a lookup and hit the unique index as a
  // 500, where this returns the same 409 to whichever one loses.
  const [created] = await db
    .insert(serialNumberEntry)
    .values({
      serialNumber: serial,
      series: data.series?.trim() || null,
      modelName: data.modelName?.trim() || null,
      batch: data.batch?.trim() || null,
      status: data.status,
      note: data.note?.trim() || null,
      createdBy: session.username,
    })
    .onConflictDoNothing({ target: serialNumberEntry.serialNumber })
    .returning({ id: serialNumberEntry.id })

  if (!created) {
    return NextResponse.json({ error: 'SERIAL_EXISTS' }, { status: 409 })
  }

  await recordAudit({
    action: 'CREATE',
    operator: session.username,
    serialId: created.id,
    serialNumber: serial,
    details: `Added manually with status ${data.status}`,
    changes: {
      series: data.series ?? null,
      modelName: data.modelName ?? null,
      batch: data.batch ?? null,
      status: data.status,
    },
  })

  return NextResponse.json({ id: created.id }, { status: 201 })
}
