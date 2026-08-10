import { desc } from 'drizzle-orm'
import { can, getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { contactSubmission } from '@/lib/db/schema'
import { categoryLabel, type ContactCategory } from '@/types/contact'
import { csvResponse, toCsv } from '@/lib/csv'

/** Every contact form enquiry, as a spreadsheet. */
export async function GET() {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!can(session, 'export')) {
    return new Response('Your role cannot export data.', { status: 403 })
  }

  const rows = await db
    .select()
    .from(contactSubmission)
    .orderBy(desc(contactSubmission.submittedAt))

  const csv = toCsv(
    [
      '受付日時', 'お問い合わせ種別', '姓', '名', '会社名',
      'メールアドレス', '国番号', '電話番号', 'ショールーム予約', '希望日時',
      'お問い合わせ内容', '送信先', 'メール送信',
    ],
    rows.map((r) => [
      r.submittedAt,
      categoryLabel(r.category as ContactCategory),
      r.lastName, r.firstName, r.companyName,
      r.email, r.countryCode, r.phoneNumber,
      r.showroomReservation ? 'あり' : 'なし', r.preferredDateTime,
      r.message, r.routedTo, r.delivered ? '成功' : '失敗',
    ])
  )

  return csvResponse('jomoo-contact-enquiries', csv)
}
