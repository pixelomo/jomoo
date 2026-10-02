import { can, getAdminSession } from '@/lib/admin-auth'
import { csvResponse, toCsv } from '@/lib/csv'
import { listPartners } from '@/lib/partners'
import { PARTNER_STATUS_LABELS, type PartnerStatus } from '@/lib/memberProfile'

/**
 * パートナー members and their company details, as a spreadsheet. Takes the
 * Partners page's own filters (`q`, `status`), plus `ids` for the ticked rows.
 */
export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!can(session, 'export')) {
    return new Response('Your role cannot export data.', { status: 403 })
  }

  const params = new URL(req.url).searchParams
  const ids = params.get('ids')?.split(',').map((id) => id.trim()).filter(Boolean)
  const rows = await listPartners({
    q: params.get('q') ?? '',
    status: params.get('status') ?? '',
    ids,
  })

  const csv = toCsv(
    [
      '会員ID', '審査状況', '会社名', '会社名フリガナ', '担当者 姓', '担当者 名', 'セイ', 'メイ',
      'メールアドレス', '電話番号', '郵便番号', '都道府県', '市区町村', '番地', '建物名',
      '販売店', '申請日', '審査日', '審査者',
    ],
    rows.map((r) => [
      r.id,
      PARTNER_STATUS_LABELS[(r.partnerStatus ?? 'pending') as PartnerStatus] ?? r.partnerStatus,
      r.companyName, r.companyNameKana, r.lastName, r.firstName, r.lastNameKana, r.firstNameKana,
      r.email, r.phoneNumber, r.postalCode, r.prefecture, r.city, r.streetAddress, r.building,
      r.branchName, r.createdAt, r.partnerReviewedAt, r.partnerReviewedBy,
    ])
  )

  return csvResponse('jomoo-partners', csv)
}
