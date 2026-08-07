import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import { db } from './db'
import * as schema from './db/schema'
import { EMAIL_VERIFICATION_REQUIRED, TWO_FACTOR_ENABLED } from './auth-features'

function resolveAuthBaseURL() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

export const authBaseURL = resolveAuthBaseURL()

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
  baseURL: authBaseURL,
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    authBaseURL,
    'https://jomoo-ashy.vercel.app',
  ],
  emailAndPassword: {
    enabled: true,
    // Off by default — see auth-features.ts. When on, accounts cannot sign in
    // until the address is confirmed.
    requireEmailVerification: EMAIL_VERIFICATION_REQUIRED,
    // Better Auth builds and signs the link; we own the delivery so a failure
    // is logged rather than swallowed, and admins can switch it off.
    sendResetPassword: async ({ user: member, url }) => {
      const { sendPasswordReset } = await import('./resend')
      await sendPasswordReset({
        to: member.email,
        name: member.name || member.email,
        url,
      })
    },
  },
  databaseHooks: {
    user: {
      create: {
        // With verification off there is no afterEmailVerification hook to hang
        // the welcome mail on, so it goes out at account creation instead.
        // Never let a mail failure fail the sign-up: the account is already
        // written, and the member can use it whether or not the mail lands.
        after: async (createdUser) => {
          if (EMAIL_VERIFICATION_REQUIRED) return
          try {
            const { sendMemberWelcome } = await import('./resend')
            await sendMemberWelcome({
              to: createdUser.email,
              name: createdUser.name || createdUser.email,
            })
          } catch (err) {
            console.error('[auth] member welcome email failed', {
              userId: createdUser.id,
              err,
            })
          }
        },
      },
    },
  },
  emailVerification: {
    // Sent from /api/verification/send instead. Better Auth wraps this callback
    // in runInBackgroundOrAwait, which swallows a delivery failure and still
    // answers 200 — the member would be told to check an inbox that never
    // receives anything. See lib/verification-email.ts.
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendVerificationEmail: send } = await import('./resend')
      await send({
        to: user.email,
        name: user.name || user.email,
        url,
      })
    },
    // Registration is only complete once the address is confirmed, so the
    // welcome email lands here rather than at account creation — that way a
    // member never receives two emails at once.
    afterEmailVerification: async (verifiedUser) => {
      try {
        const { sendMemberWelcome } = await import('./resend')
        await sendMemberWelcome({
          to: verifiedUser.email,
          name: verifiedUser.name || verifiedUser.email,
        })
      } catch (err) {
        console.error('[auth] member welcome email failed', {
          userId: verifiedUser.id,
          err,
        })
      }
    },
  },
  // Off by default — see auth-features.ts. The two_factor table and the
  // enrolment UI are left in place so this is a one-line switch back on.
  plugins: TWO_FACTOR_ENABLED
    ? [
        twoFactor({
          issuer: 'JOMOO',
          // Enable 2FA immediately when the user completes the setup flow,
          // rather than requiring a separate TOTP verification round-trip.
          skipVerificationOnEnable: true,
        }),
      ]
    : [],
  user: {
    additionalFields: {
      gender: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      dateOfBirth: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'date_of_birth',
      },
      phoneNumber: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'phone_number',
      },
      postalCode: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'postal_code',
      },
      companyName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'company_name',
      },
      companyNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'company_name_kana',
      },
      lastName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'last_name',
      },
      firstName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'first_name',
      },
      lastNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'last_name_kana',
      },
      firstNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'first_name_kana',
      },
      prefecture: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      city: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      streetAddress: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
        fieldName: 'street_address',
      },
      building: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
