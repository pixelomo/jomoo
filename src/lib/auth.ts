import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import { db } from './db'
import * as schema from './db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    twoFactor({
      issuer: 'JOMOO',
      // Enable 2FA immediately when the user completes the setup flow,
      // rather than requiring a separate TOTP verification round-trip.
      skipVerificationOnEnable: true,
    }),
  ],
  user: {
    additionalFields: {
      gender: {
        type: 'string',
        nullable: true,
        input: true,
      },
      dateOfBirth: {
        type: 'string',
        nullable: true,
        input: true,
        fieldName: 'date_of_birth',
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
