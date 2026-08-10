import { desc, eq } from 'drizzle-orm'
import { can, getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { productRegistration, serialNumberEntry, user } from '@/lib/db/schema'
import { csvResponse, toCsv } from '@/lib/csv'
import { SERIAL_STATUS_META, isSerialStatus, recordAudit, serialFilters } from '@/lib/serialLibrary'

/**
 * The serial library as a spreadsheet, honouring whatever filter the table had
 * applied — and logged, because a full export is the one action that takes the
 * whole library out of the building.
 */
export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!can(session, 'export')) {
    return new Response('Your role cannot export data.', { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const where = serialFilters(searchParams)

  const rows = await db
    .select({
      serialNumber: serialNumberEntry.serialNumber,
      series: serialNumberEntry.series,
      modelName: serialNumberEntry.modelName,
      batch: serialNumberEntry.batch,
      status: serialNumberEntry.status,
      note: serialNumberEntry.note,
      registrationId: serialNumberEntry.registrationId,
      boundAt: serialNumberEntry.boundAt,
      userName: user.name,
      userEmail: user.email,
      registrationStatus: productRegistration.status,
      createdBy: serialNumberEntry.createdBy,
      createdAt: serialNumberEntry.createdAt,
    })
    .from(serialNumberEntry)
    .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
    .leftJoin(productRegistration, eq(serialNumberEntry.registrationId, productRegistration.id))
    .where(where)
    .orderBy(desc(serialNumberEntry.createdAt))

  const csv = toCsv(
    [
      '製造番号', 'シリーズ', '型番', 'バッチ', 'ステータス', '備考',
      '登録ID', '紐付け日時', '会員名', 'メールアドレス', '登録状態',
      '登録者', '登録日時',
    ],
    rows.map((r) => [
      r.serialNumber, r.series, r.modelName, r.batch,
      isSerialStatus(r.status) ? SERIAL_STATUS_META[r.status].label : r.status,
      r.note, r.registrationId, r.boundAt, r.userName, r.userEmail, r.registrationStatus,
      r.createdBy, r.createdAt,
    ])
  )

  await recordAudit({
    action: 'EXPORT',
    operator: session.username,
    details:
      `Exported ${rows.length} serial${rows.length === 1 ? '' : 's'}` +
      (searchParams.toString() ? ` (filter: ${searchParams.toString()})` : ' (no filter)'),
    changes: {
      rows: rows.length,
      filter: Object.fromEntries(searchParams.entries()),
    },
  })

  return csvResponse('jomoo-serial-numbers', csv)
}
