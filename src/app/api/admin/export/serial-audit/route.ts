import { desc } from 'drizzle-orm'
import { can, getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialAuditLog } from '@/lib/db/schema'
import { csvResponse, toCsv } from '@/lib/csv'

/** The audit trail as a spreadsheet, for handing to whoever is asking. */
export async function GET() {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!can(session, 'export')) {
    return new Response('Your role cannot export data.', { status: 403 })
  }

  const rows = await db
    .select()
    .from(serialAuditLog)
    .orderBy(desc(serialAuditLog.createdAt))
    .limit(50_000)

  const csv = toCsv(
    ['日時', '操作', '操作者', '製造番号', '内容', '変更詳細', 'バッチID'],
    rows.map((r) => [
      r.createdAt,
      r.action,
      r.operator,
      r.serialNumber,
      r.details,
      r.changes ? JSON.stringify(r.changes) : '',
      r.batchId,
    ])
  )

  return csvResponse('jomoo-serial-audit-log', csv)
}
