import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import WarrantyCard from '@/components/warranty/WarrantyCard'
import type { DbProductRegistration, DbWarrantyRecord } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WarrantyPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { id } = await params
  const t = await getTranslations('warranty')

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

  return (
    <main className="flex-1 px-4 py-12">
      <WarrantyCard
        registration={reg as unknown as DbProductRegistration}
        warranty={warranty as unknown as DbWarrantyRecord}
        customerName={session.user.name}
        t={{
          cardTitle: t('cardTitle'),
          product: t('product'),
          registrationId: t('registrationId'),
          customerName: t('customerName'),
          serialNumber: t('serialNumber'),
          purchaseDate: t('purchaseDate'),
          installationDate: t('installationDate'),
          warrantyExpiry: t('warrantyExpiry'),
          issuedOn: t('issuedOn'),
          print: t('print'),
        }}
      />
    </main>
  )
}
