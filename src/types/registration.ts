import { z } from 'zod'
import { SERIAL_NUMBER_PATTERN, normaliseSerialNumber } from '@/lib/serialValidation'

export const Step1Schema = z.object({
  modelId: z.string().min(1, 'validation.required'),
  modelName: z.string().min(1, 'validation.required'),
  installationDate: z.string().min(1, 'validation.required'),
  installationAddressState: z.string().min(1, 'validation.required'),
  installationAddressDetail: z.string().min(1, 'validation.required'),
  contactPerson: z.string().min(1, 'validation.required'),
  phoneNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  dealerName: z.string().optional(),
})

export const Step2Schema = z.object({
  // Normalised before checking so spaces, dashes and full-width digits from a
  // Japanese IME are accepted rather than bounced back at the member.
  serialNumber: z
    .string()
    .min(1, 'validation.required')
    .transform(normaliseSerialNumber)
    .refine((v) => SERIAL_NUMBER_PATTERN.test(v), 'validation.serialFormat'),
  serialNumberValid: z.boolean().optional(),
  proceedDespiteInvalid: z.boolean().optional(),
})

export const Step3Schema = z.object({
  warrantyCardUrl: z.string().min(1, 'validation.required'),
  serialNumberImageUrl: z.string().min(1, 'validation.required'),
})

export const RegistrationSchema = Step1Schema.merge(Step2Schema).merge(Step3Schema)

export type Step1Data = z.infer<typeof Step1Schema>
export type Step2Data = z.infer<typeof Step2Schema>
export type Step3Data = z.infer<typeof Step3Schema>
export type RegistrationData = z.infer<typeof RegistrationSchema>
