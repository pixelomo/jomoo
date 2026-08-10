import { NextResponse } from 'next/server'
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialAuditLog } from '@/lib/db/schema'
import { AUDIT_ACTIONS, type AuditAction } from '@/lib/serialLibrary'

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
  const action = searchParams.get('action')
  const operator = searchParams.get('operator')?.trim()
  const q = searchParams.get('q')?.trim()

  const clauses: SQL[] = []
  if (action && (AUDIT_ACTIONS as readonly string[]).includes(action)) {
    clauses.push(eq(serialAuditLog.action, action as AuditAction))
  }
  if (operator) clauses.push(eq(serialAuditLog.operator, operator))
  if (q) {
    const clause = or(
      ilike(serialAuditLog.serialNumber, `%${q.toUpperCase()}%`),
      ilike(serialAuditLog.details, `%${q}%`),
      ilike(serialAuditLog.operator, `%${q}%`)
    )
    if (clause) clauses.push(clause)
  }
  const where = clauses.length ? and(...clauses) : undefined

  const entries = await db
    .select()
    .from(serialAuditLog)
    .where(where)
    .orderBy(desc(serialAuditLog.createdAt))
    .limit(limit)
    .offset((page - 1) * limit)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(serialAuditLog)
    .where(where)

  return NextResponse.json({ entries, total, page, limit })
}
