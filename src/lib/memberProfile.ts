/**
 * What a dealer account may no longer change about itself.
 *
 * A パートナー account's 会社名 and address are not just its own contact details —
 * they are the branch row other people register products against
 * (lib/dealerBranches.ts keys a branch on the folded name plus the postal
 * code). Letting one employee rename the company or move it would either
 * retarget every registration filed against that branch or split the branch in
 * two, and the customers on the far side of it would never know.
 *
 * So the details are captured once, at sign-up, and changed after that by an
 * admin who can see what else moves with them.
 */
export const DEALER_LOCKED_FIELDS = [
  'companyName',
  'companyNameKana',
  'postalCode',
  'prefecture',
  'city',
  'streetAddress',
  'building',
] as const

export type DealerLockedField = (typeof DEALER_LOCKED_FIELDS)[number]

/** パートナー members, whether or not the application has been approved: the
 *  company details are what staff review, so they are locked from the start.
 *  法人 members fill in the same form but are customers, not dealers. */
export function isDealerAccount(memberType: unknown): boolean {
  return memberType === 'partner'
}

export type PartnerStatus = 'pending' | 'approved' | 'rejected'

/** Whether the dealer features — the branch, its 支店の登録製品 tab and the
 *  serials filed against it — are open to this account. A partner with no
 *  status yet is an application nobody has looked at. */
export function isApprovedPartner(member: { memberType?: unknown; partnerStatus?: unknown } | null | undefined) {
  return member?.memberType === 'partner' && member.partnerStatus === 'approved'
}

export const MEMBER_TYPE_LABELS: Record<string, string> = {
  partner: 'パートナー',
  corporate: '法人',
  individual: '個人',
}

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  pending: '審査中',
  approved: '承認済み',
  rejected: '否認',
}

export function isDealerLockedField(key: string): key is DealerLockedField {
  return (DEALER_LOCKED_FIELDS as readonly string[]).includes(key)
}

/** The line shown beside a field a dealer cannot edit. */
export const DEALER_LOCKED_NOTE =
  '※会社名・ご住所は販売店情報として製品登録に使用されるため、変更をご希望の場合はお問い合わせフォームよりご連絡ください。'
