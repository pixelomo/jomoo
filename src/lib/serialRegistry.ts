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

/**
 * True when a write failed because the serial is already taken.
 *
 * Drizzle wraps driver errors, so the Postgres SQLSTATE sits on the cause
 * rather than the thrown object — checking only the top level silently misses
 * every collision and turns a 409 into a 500.
 */
export function isDuplicateSerialError(err: unknown): boolean {
  let current: unknown = err
  for (let depth = 0; current && depth < 5; depth++) {
    const candidate = current as { code?: unknown; constraint_name?: unknown; cause?: unknown }
    if (candidate.code === '23505' && candidate.constraint_name === 'idx_reg_serial_unique') {
      return true
    }
    current = candidate.cause
  }
  return false
}
