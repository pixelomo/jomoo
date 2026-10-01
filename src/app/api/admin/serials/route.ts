import { NextResponse } from 'next/server'
import { z } from 'zod'
import { desc, eq, sql } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialNumberEntry, user } from '@/lib/db/schema'
import { hasValidSerialFormat, normaliseSerialNumber } from '@/lib/serialValidation'
import { SERIAL_STATUSES, recordAudit, serialFilters } from '@/lib/serialLibrary'
import {
  SERIES_ID_PATTERN,
  createCatalogDrafts,
  findProduct,
  findSeries,
  loadCatalog,
  type CreatedDraft,
} from '@/lib/catalogDrafts'

const CreateSchema = z.object({
  serialNumber: z.string().min(1).max(64),
  series: z.string().max(64).nullish(),
  modelName: z.string().max(200).nullish(),
  batch: z.string().max(120).nullish(),
  status: z.enum(SERIAL_STATUSES).default('UNUSED'),
  note: z.string().max(1000).nullish(),
  /** A series the CMS does not have yet — created as a draft, and the serial filed under it. */
  newSeries: z
    .object({ seriesId: z.string().regex(SERIES_ID_PATTERN).max(60), name: z.string().trim().min(1).max(100) })
    .nullish(),
  /** Start a draft product for a model the CMS does not have yet. */
  createProduct: z.boolean().default(false),
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

  // Refuse a duplicate before touching the CMS, so a serial that is already
  // in the library cannot leave a stray draft series behind it.
  const [taken] = await db
    .select({ id: serialNumberEntry.id })
    .from(serialNumberEntry)
    .where(eq(serialNumberEntry.serialNumber, serial))
    .limit(1)
  if (taken) return NextResponse.json({ error: 'SERIAL_EXISTS' }, { status: 409 })

  // New series and models become drafts in the CMS; staff publish them there.
  let seriesId = data.series?.trim() || null
  let drafts: CreatedDraft[] = []
  const model = data.modelName?.trim() || null
  if (data.newSeries || (data.createProduct && model)) {
    try {
      const catalog = await loadCatalog()
      if (data.newSeries) seriesId = data.newSeries.seriesId
      else if (seriesId) seriesId = findSeries(catalog, seriesId)?.seriesId ?? seriesId
      drafts = await createCatalogDrafts(catalog, {
        series: data.newSeries ? [data.newSeries] : [],
        products: data.createProduct && model && !findProduct(catalog, model) ? [{ model, seriesId }] : [],
      })
    } catch (err) {
      console.error('[serials] could not create CMS drafts', err)
      return NextResponse.json({ error: 'CMS_WRITE_FAILED' }, { status: 502 })
    }
  }

  // onConflictDoNothing rather than a lookup-then-insert: two admins adding the
  // same serial at once would slip past a lookup and hit the unique index as a
  // 500, where this returns the same 409 to whichever one loses.
  const [created] = await db
    .insert(serialNumberEntry)
    .values({
      serialNumber: serial,
      series: seriesId,
      modelName: model,
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
      series: seriesId,
      modelName: model,
      batch: data.batch ?? null,
      status: data.status,
    },
  })

  return NextResponse.json({ id: created.id, drafts }, { status: 201 })
}
