import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration } from '@/lib/db/schema'
import { eq, desc, sql, ilike, or } from 'drizzle-orm'

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const baseQuery = db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      regCount: sql<number>`count(${productRegistration.id})::int`,
    })
    .from(user)
    .leftJoin(productRegistration, eq(productRegistration.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset)

  const users = q
    ? await baseQuery.where(or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`)))
    : await baseQuery

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(user)

  return NextResponse.json({ users, total, page, limit })
}
