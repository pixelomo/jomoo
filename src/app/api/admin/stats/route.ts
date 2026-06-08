import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [userRow] = await db.select({ count: sql<number>`count(*)::int` }).from(user)
  const [withWarranty] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productRegistration)
    .where(eq(productRegistration.status, 'REGISTERED_WITH_WARRANTY'))
  const [noWarranty] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productRegistration)
    .where(eq(productRegistration.status, 'REGISTERED_NO_WARRANTY'))

  const recent = await db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .orderBy(desc(productRegistration.submittedAt))
    .limit(10)

  return NextResponse.json({
    users: userRow.count,
    withWarranty: withWarranty.count,
    noWarranty: noWarranty.count,
    recent,
  })
}
