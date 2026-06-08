import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const statusMap: Record<string, string | undefined> = {
    warranty: 'REGISTERED_WITH_WARRANTY',
    no_warranty: 'REGISTERED_NO_WARRANTY',
  }

  const rows = await db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      installationDate: productRegistration.installationDate,
      userName: user.name,
      userEmail: user.email,
      userId: productRegistration.userId,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(statusMap[filter] ? eq(productRegistration.status, statusMap[filter]!) : undefined)
    .orderBy(desc(productRegistration.submittedAt))
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(productRegistration)
    .where(statusMap[filter] ? eq(productRegistration.status, statusMap[filter]!) : undefined)

  return NextResponse.json({ registrations: rows, total, page, limit })
}
