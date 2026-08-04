import { z } from 'zod'
import { serialPatternFor, normaliseSerialNumber } from '@/lib/serialValidation'

export const Step1Schema = z.object({
  modelId: z.string().min(1, 'validation.required'),
  modelName: z.string().min(1, 'validation.required'),
  /** Set from the chosen model; picks the serial length in step 2. */
  modelSeries: z.string().optional(),
  installationDate: z.string().min(1, 'validation.required'),
  installationAddressState: z.string().min(1, 'validation.required'),
  installationAddressDetail: z.string().min(1, 'validation.required'),
  contactPerson: z.string().min(1, 'validation.required'),
  phoneNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  dealerName: z.string().optional(),
})

/**
 * Unrefined so it can still be merged into RegistrationSchema — Zod refuses to
 * merge a schema carrying refinements. The serial check is applied to both
 * schemas below instead.
 */
const Step2Fields = z.object({
  // Normalised before checking so spaces, dashes and full-width digits from a
  // Japanese IME are accepted rather than bounced back at the member.
  serialNumber: z.string().min(1, 'validation.required').transform(normaliseSerialNumber),
  modelSeries: z.string().optional(),
  serialNumberValid: z.boolean().optional(),
  proceedDespiteInvalid: z.boolean().optional(),
})

/**
 * Serial length differs by product line, so the rule needs the series alongside
 * the number rather than being fixed on the field.
 *
 * On the server this only catches obvious junk: modelSeries arrives from the
 * browser, so the authoritative check re-derives the series from Sanity in
 * /api/registrations before deciding whether a warranty is issued.
 */
const checkSerialAgainstSeries = (
  data: { serialNumber: string; modelSeries?: string },
  ctx: z.RefinementCtx
) => {
  if (!serialPatternFor(data.modelSeries).test(data.serialNumber)) {
    ctx.addIssue({ code: 'custom', path: ['serialNumber'], message: 'validation.serialFormat' })
  }
}

export const Step2Schema = Step2Fields.superRefine(checkSerialAgainstSeries)

export const Step3Schema = z.object({
  warrantyCardUrl: z.string().min(1, 'validation.required'),
  serialNumberImageUrl: z.string().min(1, 'validation.required'),
})

export const RegistrationSchema = Step1Schema.merge(Step2Fields)
  .merge(Step3Schema)
  .superRefine(checkSerialAgainstSeries)

export type Step1Data = z.infer<typeof Step1Schema>
export type Step2Data = z.infer<typeof Step2Schema>
export type Step3Data = z.infer<typeof Step3Schema>
export type RegistrationData = z.infer<typeof RegistrationSchema>
