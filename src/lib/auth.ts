import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import { db } from './db'
import * as schema from './db/schema'
import { EMAIL_VERIFICATION_REQUIRED, TWO_FACTOR_ENABLED } from './auth-features'
import { appOrigin } from './appUrl'

export const authBaseURL = appOrigin()

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
          // A 法人 sign-up is how a dealer branch gets on the list customers
          // pick from, so this runs whether or not verification is on.
          const member = createdUser as typeof createdUser & {
            memberType?: string | null
            companyName?: string | null
            companyNameKana?: string | null
            postalCode?: string | null
            prefecture?: string | null
            city?: string | null
            streetAddress?: string | null
            building?: string | null
          }

          if (member.memberType === 'corporate') {
            const { linkMemberToBranch } = await import('./dealerBranches')
            await linkMemberToBranch(createdUser.id, member)
          }

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
      },
      phoneNumber: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      postalCode: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      companyName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      // 'corporate' or 'individual'. Written at sign-up because nothing else
      // records it — a company name is a hint, not an answer.
      memberType: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      // Assigned by the create hook below, never by the browser: this is what
      // decides whose registrations an account may read.
      branchId: {
        type: 'string',
        nullable: true,
        required: false,
        input: false,
      },
      companyNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      lastName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      firstName: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      lastNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
      },
      firstNameKana: {
        type: 'string',
        nullable: true,
        required: false,
        input: true,
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
