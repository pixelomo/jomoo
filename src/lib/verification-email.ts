import { createEmailVerificationToken } from 'better-auth/api'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { user as userTable } from './db/schema'
import { authBaseURL } from './auth'
import { sendVerificationEmail as sendMail } from './resend'

/**
 * Better Auth routes the verification mail through `runInBackgroundOrAwait`,
 * which catches and logs a delivery failure rather than surfacing it — sign-up
 * answers 200 whether or not the mail actually went out. We build and send the
 * same message ourselves so the caller sees the failure and can tell the member
 * the truth instead of pointing them at an inbox that will stay empty.
 */

export type SendVerificationResult =
  | { status: 'sent' }
  /** No account, or one that is already confirmed — nothing to send, and we
   *  deliberately do not tell the caller which, so the endpoint cannot be used
   *  to probe which addresses are registered. */
  | { status: 'noop' }

export async function sendVerificationEmailOrThrow(
  email: string,
  callbackURL = '/'
): Promise<SendVerificationResult> {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not set')

  const normalised = email.trim().toLowerCase()

  const [member] = await db
    .select({ email: userTable.email, name: userTable.name, emailVerified: userTable.emailVerified })
    .from(userTable)
    .where(eq(userTable.email, normalised))
    .limit(1)

  if (!member || member.emailVerified) return { status: 'noop' }

  // Mirrors better-auth's own link construction (api/routes/email-verification.ts):
  // the token is a JWT signed with the auth secret, and the handler lives under
  // the auth basePath, so a link built here verifies through the standard route.
  const token = await createEmailVerificationToken(secret, member.email)
  const url = `${authBaseURL}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`

  await sendMail({
    to: member.email,
    name: member.name || member.email,
    url,
  })

  return { status: 'sent' }
}
