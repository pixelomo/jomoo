import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord, ownershipTransfer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const [reg] = await db
    .select({
      id: productRegistration.id,
      userId: productRegistration.userId,
      modelId: productRegistration.modelId,
      modelName: productRegistration.modelName,
      installationDate: productRegistration.installationDate,
      installationAddressState: productRegistration.installationAddressState,
      installationAddressDetail: productRegistration.installationAddressDetail,
      contactPerson: productRegistration.contactPerson,
      phoneNumber: productRegistration.phoneNumber,
      purchaseDate: productRegistration.purchaseDate,
      dealerName: productRegistration.dealerName,
      serialNumber: productRegistration.serialNumber,
      serialNumberValid: productRegistration.serialNumberValid,
      warrantyCardUrl: productRegistration.warrantyCardUrl,
      serialNumberImageUrl: productRegistration.serialNumberImageUrl,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.id, id))
    .limit(1)

  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const transfers = await db
    .select()
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.registrationId, id))

  return NextResponse.json({ registration: reg, transfers })
}
