import { z } from 'zod'

/**
 * Inquiry categories, in the order the visitor sees them.
 *
 * `email` is the department the inquiry is sent to. These are the client's own
 * business addresses rather than secrets, so they live here where the routing
 * is reviewable in a diff — and, unlike environment variables, cannot silently
 * go missing and dump every category into one inbox.
 *
 * A CONTACT_TO_<ID> environment variable still overrides the address if one is
 * set, so a department can be redirected without a deploy.
 */
export const CONTACT_CATEGORIES = [
  { id: 'partnership', label: '業務提携・アライアンスについて',   email: 'business@jomoogroup.com'   },
  { id: 'product',     label: '製品・サービスに関するお問い合わせ', email: 'aftersales@jomoogroup.com' },
  { id: 'materials',   label: '資料請求・お見積り',              email: 'business@jomoogroup.com'   },
  { id: 'support',     label: 'ご利用中のお客様サポート',         email: 'aftersales@jomoogroup.com' },
  { id: 'fault',       label: '不具合・障害報告',                email: 'aftersales@jomoogroup.com' },
  { id: 'recruitment', label: '採用に関するお問い合わせ',         email: 'yangyang01@jomoo.com'      },
] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]['id']

const CATEGORY_IDS = CONTACT_CATEGORIES.map(c => c.id) as [
  ContactCategory,
  ...ContactCategory[],
]

export function categoryLabel(id: ContactCategory): string {
  return CONTACT_CATEGORIES.find(c => c.id === id)?.label ?? id
}

/** The department address an inquiry in this category belongs to. */
export function categoryEmail(id: ContactCategory): string | undefined {
  return CONTACT_CATEGORIES.find(c => c.id === id)?.email
}

export const ContactSchema = z
  .object({
    category: z.enum(CATEGORY_IDS),
    lastName: z.string().min(1),
    firstName: z.string().min(1),
    companyName: z.string().optional(),
    email: z.string().email(),
    countryCode: z.string().optional(),
    phoneNumber: z
      .string()
      .optional()
      .refine((value) => !value || /^\d+$/.test(value), 'phoneDigitsOnly'),
    message: z.string().min(1),
    showroomReservation: z.boolean(),
    preferredDateTime: z.string().optional(),
  })
  .refine(
    (data) => !data.showroomReservation || Boolean(data.preferredDateTime),
    { message: 'showroomDateRequired', path: ['preferredDateTime'] }
  )

export type ContactData = z.infer<typeof ContactSchema>
