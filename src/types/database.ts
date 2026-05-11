export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type RegistrationStatus =
  | 'PENDING'
  | 'RETURNED'
  | 'REGISTERED_NO_WARRANTY'
  | 'REGISTERED_WITH_WARRANTY'

export interface DbUser {
  id: string
  clerk_id: string
  email: string
  nickname: string | null
  gender: Gender | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export interface DbProductRegistration {
  id: string
  user_id: string
  model_id: string
  model_name: string
  installation_date: string
  installation_address_state: string
  installation_address_detail: string
  contact_person: string
  phone_number: string | null
  purchase_date: string | null
  dealer_name: string | null
  serial_number: string
  serial_number_valid: boolean | null
  warranty_card_url: string | null
  serial_number_image_url: string | null
  status: RegistrationStatus
  flagged_for_review: boolean
  submitted_at: string
  reviewed_at: string | null
  reviewer_id: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

export interface DbWarrantyRecord {
  id: string
  registration_id: string
  expiry_date: string
  card_generated: boolean
  created_at: string
  updated_at: string
}

export interface DbOwnershipTransfer {
  id: string
  registration_id: string
  changed_by: string
  previous_address_state: string | null
  previous_address_detail: string | null
  previous_contact_person: string | null
  previous_phone_number: string | null
  new_address_state: string | null
  new_address_detail: string | null
  new_contact_person: string | null
  new_phone_number: string | null
  created_at: string
}
