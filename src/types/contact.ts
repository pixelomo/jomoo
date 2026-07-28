import { z } from 'zod'

/**
 * Inquiry categories. `id` drives routing — each id has a matching
 * CONTACT_TO_<ID> env var holding that department's address (see CATEGORY_ENV
 * in lib/resend.ts). `label` is what the visitor picks from.
 */
export const CONTACT_CATEGORIES = [
  { id: 'product',      label: '製品について' },
  { id: 'purchase',     label: 'ご購入・お見積り' },
  { id: 'support',      label: 'アフターサービス・修理' },
  { id: 'installation', label: '施工・技術サポート' },
  { id: 'partnership',  label: 'パートナーシップ・代理店' },
  { id: 'other',        label: 'その他' },
] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]['id']

const CATEGORY_IDS = CONTACT_CATEGORIES.map(c => c.id) as [
  ContactCategory,
  ...ContactCategory[],
]

export function categoryLabel(id: ContactCategory): string {
  return CONTACT_CATEGORIES.find(c => c.id === id)?.label ?? id
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
