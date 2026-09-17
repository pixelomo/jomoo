import { z } from 'zod'

/**
 * The inboxes an inquiry can land in.
 *
 * A department is both a destination and an audience: it is the address the
 * contact form mails, and it is the scope an admin account can be pinned to so
 * the after-sales desk is not reading recruitment applications. Defining it
 * once means those two can never drift apart — an address moved here moves the
 * routing and the portal's filter together.
 */
export const CONTACT_DEPARTMENTS = [
  { id: 'business',    label: '営業・アライアンス', labelEn: 'Business & Sales',  email: 'business@jomoogroup.com'   },
  { id: 'aftersales',  label: 'カスタマーサポート', labelEn: 'Customer Support',  email: 'aftersales@jomoogroup.com' },
  { id: 'recruitment', label: '採用',             labelEn: 'Recruitment',       email: 'yangyang01@jomoo.com'      },
] as const

export type ContactDepartment = (typeof CONTACT_DEPARTMENTS)[number]['id']

export const CONTACT_DEPARTMENT_IDS = CONTACT_DEPARTMENTS.map(d => d.id) as ContactDepartment[]

export function isContactDepartment(value: unknown): value is ContactDepartment {
  return typeof value === 'string' && CONTACT_DEPARTMENT_IDS.includes(value as ContactDepartment)
}

export function departmentLabel(id: ContactDepartment): string {
  return CONTACT_DEPARTMENTS.find(d => d.id === id)?.labelEn ?? id
}

export function departmentEmail(id: ContactDepartment): string | undefined {
  return CONTACT_DEPARTMENTS.find(d => d.id === id)?.email
}

/**
 * Inquiry categories, in the order the visitor sees them.
 *
 * `department` is who the inquiry belongs to. These are the client's own
 * business addresses rather than secrets, so the routing lives here where it is
 * reviewable in a diff — and, unlike environment variables, cannot silently go
 * missing and dump every category into one inbox.
 *
 * A CONTACT_TO_<ID> environment variable still overrides the address if one is
 * set, so a department can be redirected without a deploy.
 */
export const CONTACT_CATEGORIES = [
  { id: 'partnership', label: '業務提携・アライアンスについて',   department: 'business'    },
  { id: 'product',     label: '製品・サービスに関するお問い合わせ', department: 'business'    },
  { id: 'materials',   label: '資料請求・お見積り',              department: 'business'    },
  { id: 'support',     label: 'ご利用中のお客様サポート',         department: 'aftersales'  },
  { id: 'fault',       label: '不具合・障害報告',                department: 'aftersales'  },
  { id: 'recruitment', label: '採用に関するお問い合わせ',         department: 'recruitment' },
] as const satisfies readonly { id: string; label: string; department: ContactDepartment }[]

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]['id']

const CATEGORY_IDS = CONTACT_CATEGORIES.map(c => c.id) as [
  ContactCategory,
  ...ContactCategory[],
]

export function categoryLabel(id: ContactCategory): string {
  return CONTACT_CATEGORIES.find(c => c.id === id)?.label ?? id
}

/** Which desk an inquiry in this category belongs to. */
export function departmentOf(id: ContactCategory): ContactDepartment | undefined {
  return CONTACT_CATEGORIES.find(c => c.id === id)?.department
}

/** The department address an inquiry in this category belongs to. */
export function categoryEmail(id: ContactCategory): string | undefined {
  const department = departmentOf(id)
  return department ? departmentEmail(department) : undefined
}

/** The categories a department-scoped admin account is allowed to read. */
export function categoriesForDepartment(
  department: ContactDepartment
): ContactCategory[] {
  return CONTACT_CATEGORIES.filter(c => c.department === department).map(c => c.id)
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
