import { z } from 'zod'
import type { Gender } from '@/types/database'

export type MembershipType = 'corporate' | 'individual'

export const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']

const optionalGender = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional()
)

const optionalDate = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().optional()
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

const addressFields = {
  postalCode: z.string().min(1),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  streetAddress: z.string().min(1),
  building: z.string().optional(),
}

const personFields = {
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  lastNameKana: z.string().min(1),
  firstNameKana: z.string().min(1),
  countryCode: z.string().min(1),
  phoneNumber: phoneDigits,
}

const credentialsFields = {
  email: z.string().email(),
  password: passwordField,
  confirmPassword: z.string().min(1),
}

function withPasswordMatch<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema.refine(
    (data) => data.password === data.confirmPassword,
    { message: 'passwordMismatch', path: ['confirmPassword'] }
  )
}

export const CorporateSignupSchema = withPasswordMatch(
  z.object({
    ...credentialsFields,
    companyName: z.string().optional(),
    companyNameKana: z.string().optional(),
    ...personFields,
    ...addressFields,
  })
)

export const IndividualSignupSchema = withPasswordMatch(
  z.object({
    ...credentialsFields,
    ...personFields,
    gender: optionalGender,
    dateOfBirth: optionalDate,
    ...addressFields,
  })
)

export type CorporateSignupData = z.infer<typeof CorporateSignupSchema>
export type IndividualSignupData = z.infer<typeof IndividualSignupSchema>

export function buildDisplayName(
  type: MembershipType,
  data: CorporateSignupData | IndividualSignupData
) {
  const fullName = `${data.lastName} ${data.firstName}`
  if (type === 'corporate' && 'companyName' in data && data.companyName) {
    return `${data.companyName} / ${fullName}`
  }
  return fullName
}
