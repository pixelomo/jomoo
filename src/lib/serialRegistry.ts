import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productRegistration } from '@/lib/db/schema'
import { normaliseSerialNumber } from '@/lib/serialValidation'

/**
 * A serial identifies one physical product, so it may only be registered once —
 * by anyone, not just once per member. Kept out of serialValidation.ts because
 * that module is imported by the registration form and must stay free of the
 * database client.
 *
 * The database's unique index is what actually guarantees this; the lookup here
 * exists so the member gets a clear message instead of a constraint error.
 */
export async function findRegistrationBySerial(serialNumber: string) {
  const serial = normaliseSerialNumber(serialNumber)
  const [existing] = await db
    .select({ id: productRegistration.id, userId: productRegistration.userId })
    .from(productRegistration)
    .where(eq(productRegistration.serialNumber, serial))
    .limit(1)
  return existing ?? null
}
