/**
 * Prints where each contact category is routed, and fails if any category has
 * no address. Resolves through the real resolver, so it reflects any
 * CONTACT_TO_<ID> overrides present in the environment.
 *
 * Deliberately sends nothing — the destinations are the client's live inboxes.
 *
 * Usage: npx tsx scripts/check-contact-routing.ts
 */
import { CONTACT_CATEGORIES, type ContactCategory } from '@/types/contact'
import { contactAddressFor } from '@/lib/resend'

const EXPECTED: Record<ContactCategory, string> = {
  partnership: 'business@jomoogroup.com',
  product: 'aftersales@jomoogroup.com',
  materials: 'business@jomoogroup.com',
  support: 'aftersales@jomoogroup.com',
  fault: 'aftersales@jomoogroup.com',
  recruitment: 'yangyang01@jomoo.com',
}

let failed = 0
console.log('category                              routed to                    ')
console.log('─'.repeat(78))

for (const { id, label } of CONTACT_CATEGORIES) {
  let address: string
  try {
    address = contactAddressFor(id)
  } catch (err) {
    address = `ERROR: ${err instanceof Error ? err.message : String(err)}`
  }
  const expected = EXPECTED[id]
  const ok = address === expected
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(28)} ${address}`)
}

const inboxes = [...new Set(Object.values(EXPECTED))]
console.log('─'.repeat(78))
for (const inbox of inboxes) {
  const owned = CONTACT_CATEGORIES.filter((c) => EXPECTED[c.id] === inbox)
  console.log(`${inbox.padEnd(28)} ${owned.length} categor${owned.length === 1 ? 'y' : 'ies'}`)
}

if (failed) {
  console.error(`\n${failed} category/categories routed somewhere unexpected.`)
  process.exit(1)
}
console.log('\nAll categories routed as specified.')
