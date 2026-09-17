import { categoryEmail, type ContactCategory } from '@/types/contact'

/**
 * Routes to the department that owns the selected category.
 *
 * The address in types/contact.ts is the source of truth; a CONTACT_TO_<ID>
 * environment variable overrides it so a department can be redirected without
 * a deploy. CONTACT_TO_EMAIL is the last resort and should never be reached —
 * every category ships with an address.
 *
 * This lives apart from lib/resend.ts, which it used to sit inside, because
 * where an enquiry goes is worth checking without standing up a mailer: resend
 * pulls in lib/notifications.ts and its `import 'server-only'`, which no plain
 * node or tsx process can resolve, so scripts/check-contact-routing.ts could
 * not run at all. Nothing here touches the database or the network.
 */
export function contactAddressFor(category: ContactCategory) {
  if (process.env.NODE_ENV === 'development' && process.env.CONTACT_DEV_TO_EMAIL?.trim()) {
    return process.env.CONTACT_DEV_TO_EMAIL.trim()
  }

  const override = process.env[`CONTACT_TO_${category.toUpperCase()}`]?.trim()
  const address = override || categoryEmail(category) || process.env.CONTACT_TO_EMAIL?.trim()

  if (!address) throw new Error(`No contact address configured for category "${category}"`)
  return address
}
