import { z } from 'zod'

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
  serialNumber: z.string().min(1, 'validation.required'),
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
