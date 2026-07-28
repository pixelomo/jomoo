import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import { db } from './db'
import * as schema from './db/schema'

function resolveAuthBaseURL() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

const authBaseURL = resolveAuthBaseURL()

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
    // Accounts cannot sign in until the address is confirmed
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
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
