import { z } from 'zod'
import type { Gender } from '@/types/database'

export type MembershipType = 'corporate' | 'individual'

/** The design draws 性別 as a free-text box, but the dashboard and admin forms
 *  render it as a select over exactly these four, so a value outside the list
 *  would save and then show as blank everywhere else. */
export const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']

const optionalText = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().optional()
)

const optionalGender = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional()
)

const phoneDigits = z
  .string()
  .min(1)
  .regex(/^\d+$/, 'phoneDigitsOnly')

const passwordField = z
  .string()
  .min(8, 'passwordMinLength')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).+$/,
    'passwordComplexity'
  )

const nameFields = {
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  lastNameKana: z.string().min(1),
  firstNameKana: z.string().min(1),
}

const credentialsFields = {
  email: z.string().email(),
  password: passwordField,
  confirmPassword: z.string().min(1),
}

/** 生年月日 is three selects, so it arrives in three parts and is recomposed
 *  on submit. All or nothing — a half-entered date is not a date. */
const birthFields = {
  birthYear: optionalText,
  birthMonth: optionalText,
  birthDay: optionalText,
}

function withPasswordMatch<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema.refine(
    (data) => data.password === data.confirmPassword,
    { message: 'passwordMismatch', path: ['confirmPassword'] }
  )
}

/** Corporate: the address is part of the company record, so every line of it is
 *  required — 建物名 included. No phone number is collected. */
export const CorporateSignupSchema = withPasswordMatch(
  z.object({
    ...credentialsFields,
    companyName: z.string().min(1),
    companyNameKana: optionalText,
    ...nameFields,
    postalCode: z.string().min(1),
    prefecture: z.string().min(1),
    city: z.string().min(1),
    streetAddress: z.string().min(1),
    building: z.string().min(1),
  })
)

/** Individual: the phone number is required and the address is not — the
 *  reverse of the corporate form. 性別 is free text rather than a fixed list. */
export const IndividualSignupSchema = withPasswordMatch(
  z.object({
    ...credentialsFields,
    ...nameFields,
    gender: optionalGender,
    ...birthFields,
    countryCode: z.string().min(1),
    phoneNumber: phoneDigits,
    postalCode: optionalText,
    prefecture: optionalText,
    city: optionalText,
    streetAddress: optionalText,
    building: optionalText,
  })
)

export type CorporateSignupData = z.infer<typeof CorporateSignupSchema>
export type IndividualSignupData = z.infer<typeof IndividualSignupSchema>
export type SignupData = Partial<CorporateSignupData & IndividualSignupData>

export function buildDisplayName(type: MembershipType, data: SignupData) {
  const fullName = [data.lastName, data.firstName].filter(Boolean).join(' ')
  if (type === 'corporate' && data.companyName) {
    return `${data.companyName} / ${fullName}`
  }
  return fullName
}

/** Recomposes the three 生年月日 selects into the YYYY-MM-DD the column holds.
 *  Returns undefined unless all three parts are present. */
export function buildDateOfBirth(data: SignupData) {
  const { birthYear, birthMonth, birthDay } = data
  if (!birthYear || !birthMonth || !birthDay) return undefined
  return `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
}
