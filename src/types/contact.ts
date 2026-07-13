import { z } from 'zod'

export const ContactSchema = z
  .object({
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
