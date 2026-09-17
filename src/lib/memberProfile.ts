/**
 * What a dealer account may no longer change about itself.
 *
 * A 法人 account's 会社名 and address are not just its own contact details —
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

/** 法人 members. `memberType` is null on accounts that predate the two being
 *  told apart; the backfill script gives those one. */
export function isDealerAccount(memberType: unknown): boolean {
  return memberType === 'corporate'
}

export function isDealerLockedField(key: string): key is DealerLockedField {
  return (DEALER_LOCKED_FIELDS as readonly string[]).includes(key)
}

/** The line shown beside a field a dealer cannot edit. */
export const DEALER_LOCKED_NOTE =
  '※会社名・ご住所は販売店情報として製品登録に使用されるため、変更をご希望の場合はお問い合わせフォームよりご連絡ください。'
