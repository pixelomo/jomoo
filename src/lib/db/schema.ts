import { pgTable, text, boolean, timestamp, date, index } from 'drizzle-orm/pg-core'

// ─── Better Auth core tables ──────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  // Two-factor (added by the twoFactor plugin)
  twoFactorEnabled: boolean('two_factor_enabled'),
  // Custom profile fields
  gender: text('gender'),
  dateOfBirth: date('date_of_birth'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (t) => [index('idx_session_user_id').on(t.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  verified: boolean('verified').notNull().default(false),
})

// ─── Application tables ───────────────────────────────────────────────────────

export const productRegistration = pgTable('product_registrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  modelId: text('model_id').notNull(),
  modelName: text('model_name').notNull(),
  installationDate: date('installation_date').notNull(),
  installationAddressState: text('installation_address_state').notNull(),
  installationAddressDetail: text('installation_address_detail').notNull(),
  contactPerson: text('contact_person').notNull(),
  phoneNumber: text('phone_number'),
  purchaseDate: date('purchase_date'),
  dealerName: text('dealer_name'),
  serialNumber: text('serial_number').notNull(),
  serialNumberValid: boolean('serial_number_valid'),
  warrantyCardUrl: text('warranty_card_url'),
  serialNumberImageUrl: text('serial_number_image_url'),
  status: text('status').notNull().default('PENDING'),
  flaggedForReview: boolean('flagged_for_review').notNull().default(false),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewerId: text('reviewer_id'),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('idx_reg_user_id').on(t.userId),
  index('idx_reg_status').on(t.status),
])

export const warrantyRecord = pgTable('warranty_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text('registration_id').notNull().unique().references(() => productRegistration.id, { onDelete: 'cascade' }),
  expiryDate: date('expiry_date').notNull(),
  cardGenerated: boolean('card_generated').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const ownershipTransfer = pgTable('ownership_transfers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text('registration_id').notNull().references(() => productRegistration.id, { onDelete: 'cascade' }),
  changedBy: text('changed_by').notNull().references(() => user.id),
  previousAddressState: text('previous_address_state'),
  previousAddressDetail: text('previous_address_detail'),
  previousContactPerson: text('previous_contact_person'),
  previousPhoneNumber: text('previous_phone_number'),
  newAddressState: text('new_address_state'),
  newAddressDetail: text('new_address_detail'),
  newContactPerson: text('new_contact_person'),
  newPhoneNumber: text('new_phone_number'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('idx_ot_reg_id').on(t.registrationId)])
