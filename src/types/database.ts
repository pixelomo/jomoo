export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type RegistrationStatus =
  | 'PENDING'
  | 'RETURNED'
  | 'REGISTERED_NO_WARRANTY'
  | 'REGISTERED_WITH_WARRANTY'

// Better Auth user (with our custom additionalFields)
export interface DbUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  gender: Gender | null
  dateOfBirth: string | null
  twoFactorEnabled: boolean | null
  createdAt: string
  updatedAt: string
}

export interface DbProductRegistration {
  id: string
  userId: string
  modelId: string
  modelName: string
  installationDate: string
  installationAddressState: string
  installationAddressDetail: string
  contactPerson: string
  phoneNumber: string | null
  purchaseDate: string | null
  dealerName: string | null
  serialNumber: string
  serialNumberValid: boolean | null
  warrantyCardUrl: string | null
  serialNumberImageUrl: string | null
  status: RegistrationStatus
  flaggedForReview: boolean
  submittedAt: string
  reviewedAt: string | null
  reviewerId: string | null
  reviewNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface DbWarrantyRecord {
  id: string
  registrationId: string
  expiryDate: string
  cardGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface DbOwnershipTransfer {
  id: string
  registrationId: string
  changedBy: string
  previousAddressState: string | null
  previousAddressDetail: string | null
  previousContactPerson: string | null
  previousPhoneNumber: string | null
  newAddressState: string | null
  newAddressDetail: string | null
  newContactPerson: string | null
  newPhoneNumber: string | null
  createdAt: string
}
