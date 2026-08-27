import { db } from './db'
import { productRegistration, user, warrantyRecord } from './db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import type { DbProductRegistration } from '@/types/database'

export interface BranchCustomerGroup {
  userId: string
  /** Null when the account carries no name at all; the view supplies wording. */
  customerName: string | null
  email: string
  registrations: { registration: DbProductRegistration; warrantyExpiry: string | null }[]
}

/**
 * Every registration filed against one branch, split by the customer who filed
 * it. The dealer reads a list of people, not a list of serial numbers, so the
 * grouping is the point rather than a nicety.
 *
 * Left-joined to warranty_records so a registration still under review appears
 * — those are exactly the ones a dealer is most likely to be asked about.
 */
export async function getBranchRegistrations(branchId: string): Promise<BranchCustomerGroup[]> {
  const rows = await db
    .select({
      registration: productRegistration,
      expiryDate: warrantyRecord.expiryDate,
      customerId: user.id,
      customerName: user.name,
      customerLastName: user.lastName,
      customerFirstName: user.firstName,
      customerEmail: user.email,
    })
    .from(productRegistration)
    .innerJoin(user, eq(user.id, productRegistration.userId))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.branchId, branchId))
    // Customers in a stable order, and each customer's newest registration on
    // top — the same order the member's own 登録製品 list uses.
    .orderBy(asc(user.name), asc(user.id), desc(productRegistration.submittedAt))

  const groups = new Map<string, BranchCustomerGroup>()

  for (const row of rows) {
    let group = groups.get(row.customerId)

    if (!group) {
      const fullName = [row.customerLastName, row.customerFirstName].filter(Boolean).join(' ')
      group = {
        userId: row.customerId,
        // The 法人 display name is "会社名 / 担当者名", so the name parts are
        // preferred where they exist and the display name is the fallback.
        customerName: fullName || row.customerName || null,
        email: row.customerEmail,
        registrations: [],
      }
      groups.set(row.customerId, group)
    }

    group.registrations.push({
      registration: row.registration as unknown as DbProductRegistration,
      warrantyExpiry: row.expiryDate ?? null,
    })
  }

  return [...groups.values()]
}
