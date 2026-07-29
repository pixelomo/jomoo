/**
 * Optional auth features, off by default.
 *
 * The client asked for the simplest possible sign-up: no TOTP step at sign-in,
 * and no click-to-verify gate before a member can use their account. Both were
 * built and both still work — they are switched off here rather than deleted,
 * so re-enabling is an env change plus a redeploy, not a rewrite.
 *
 * NEXT_PUBLIC_ because the dashboard and sign-up form branch on them too. That
 * inlines the values at build time, which is fine for a setting that changes
 * about once a project.
 */

/** TOTP at sign-in and the enrolment panel in the dashboard. */
export const TWO_FACTOR_ENABLED = process.env.NEXT_PUBLIC_AUTH_TWO_FACTOR === 'true'

/**
 * Require a confirmed address before first sign-in. While off, sign-up signs
 * the member straight in and the verification mail is never sent — worth
 * remembering that this is also what keeps spam and typo'd addresses out, so
 * turning it back on is the fix if junk registrations show up.
 */
export const EMAIL_VERIFICATION_REQUIRED =
  process.env.NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION === 'true'
