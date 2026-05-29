import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase'
import WarrantyCard from '@/components/warranty/WarrantyCard'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function WarrantyPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const t = await getTranslations('warranty')
  const supabase = createAdminClient()

  // Verify the registration belongs to this user and has warranty
  const { data: reg } = await supabase
    .from('product_registrations')
    .select('*, users!inner(clerk_id, nickname)')
    .eq('id', id)
    .eq('status', 'REGISTERED_WITH_WARRANTY')
    .single()

  if (!reg || (reg.users as { clerk_id: string }).clerk_id !== userId) {
    notFound()
  }

  const { data: warranty } = await supabase
    .from('warranty_records')
    .select('*')
    .eq('registration_id', id)
    .single()

  if (!warranty) notFound()

  return (
    <main className="flex-1 px-4 py-12">
      <WarrantyCard
        registration={reg}
        warranty={warranty}
        customerName={(reg.users as { nickname: string | null }).nickname ?? reg.contact_person}
        t={{
          cardTitle: t('cardTitle'),
          product: t('product'),
          registrationId: t('registrationId'),
          customerName: t('customerName'),
          installationDate: t('installationDate'),
          warrantyExpiry: t('warrantyExpiry'),
          print: t('print'),
        }}
      />
    </main>
  )
}
