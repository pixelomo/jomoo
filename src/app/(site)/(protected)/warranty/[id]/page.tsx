import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import WarrantyDocument from '@/components/warranty/WarrantyDocument'
import WarrantyTerms from '@/components/warranty/WarrantyTerms'
import { STANDARD_WARRANTY_YEARS } from '@/lib/warranty'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WarrantyPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { id } = await params

  const [reg] = await db
    .select()
    .from(productRegistration)
    .where(and(
      eq(productRegistration.id, id),
      eq(productRegistration.userId, session.user.id),
      eq(productRegistration.status, 'REGISTERED_WITH_WARRANTY'),
    ))
    .limit(1)

  if (!reg) notFound()

  const [warranty] = await db
    .select()
    .from(warrantyRecord)
    .where(eq(warrantyRecord.registrationId, id))
    .limit(1)

  if (!warranty) notFound()

  // The record holds only the expiry; anything past the standard term means the
  // extension was earned at registration.
  const installed = String(reg.installationDate)
  const standardEnd = new Date(installed)
  standardEnd.setUTCFullYear(standardEnd.getUTCFullYear() + STANDARD_WARRANTY_YEARS)
  const extended = new Date(String(warranty.expiryDate)) > standardEnd

  return (
    <main className="flex-1 warranty-page">
      <WarrantyDocument
        modelName={reg.modelName}
        serialNumber={reg.serialNumber}
        installationDate={installed}
        expiryDate={String(warranty.expiryDate)}
        extended={extended}
        customerName={reg.contactPerson || session.user.name}
        addressState={reg.installationAddressState}
        addressDetail={reg.installationAddressDetail}
        phoneNumber={reg.phoneNumber}
        dealerName={reg.dealerName}
      />
      <WarrantyTerms />
    </main>
  )
}
