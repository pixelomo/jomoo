/**
 * Every field Better Auth writes must resolve to a key on the Drizzle table.
 *
 * The Drizzle adapter's checkMissingFields() looks up `schema[model][fieldName]`,
 * where fieldName is the additionalFields `fieldName` when one is set and the
 * field's own key otherwise. Drizzle tables are keyed by their JS property name
 * — `postalCode`, not `postal_code` — and already map that to the column via
 * text('postal_code'). So declaring fieldName: 'postal_code' made the adapter
 * look for a key that cannot exist, and every sign-up that sent the field died
 * with FAILED_TO_CREATE_USER.
 *
 * Run: npx tsx scripts/check-auth-schema-fields.ts
 */
import { auth } from '../src/lib/auth'
import { user } from '../src/lib/db/schema'

type FieldConfig = { fieldName?: string }

const additionalFields = (auth.options.user?.additionalFields ?? {}) as Record<
  string,
  FieldConfig
>

const tableKeys = new Set(Object.keys(user))
const failures: string[] = []

for (const [key, config] of Object.entries(additionalFields)) {
  const resolved = config.fieldName ?? key
  if (!tableKeys.has(resolved)) {
    failures.push(
      `  ${key} → looks for "${resolved}" on the user table, which has no such key`
    )
  }
}

if (failures.length) {
  console.error('Better Auth fields that the Drizzle adapter cannot resolve:\n')
  console.error(failures.join('\n'))
  console.error(
    `\nThe user table's keys are:\n  ${[...tableKeys].sort().join(', ')}\n`
  )
  process.exit(1)
}

console.log(
  `✓ all ${Object.keys(additionalFields).length} additional fields resolve to a key on the user table`
)
