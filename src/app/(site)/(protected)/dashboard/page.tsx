import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import MemberTabs from '@/components/dashboard/MemberTabs'
import UserProfileSection from '@/components/dashboard/UserProfileSection'
import RegistrationCard from '@/components/dashboard/RegistrationCard'
import WarrantySummary from '@/components/dashboard/WarrantySummary'
import type { DbProductRegistration } from '@/types/database'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const u = session.user

  const [registrations, warranties] = await Promise.all([
    db
      .select()
      .from(productRegistration)
      .where(eq(productRegistration.userId, u.id))
      .orderBy(desc(productRegistration.submittedAt)),

    db
      .select({
        registrationId: warrantyRecord.registrationId,
        expiryDate: warrantyRecord.expiryDate,
        modelName: productRegistration.modelName,
        serialNumber: productRegistration.serialNumber,
      })
      .from(warrantyRecord)
      .innerJoin(productRegistration, eq(productRegistration.id, warrantyRecord.registrationId))
      .where(eq(productRegistration.userId, u.id))
      .orderBy(desc(warrantyRecord.createdAt)),
  ])

  return (
    <MemberTabs
      isEmpty={registrations.length === 0}
      products={registrations.map((reg) => (
        <RegistrationCard key={reg.id} registration={reg as unknown as DbProductRegistration} />
      ))}
      contract={<WarrantySummary warranties={warranties} />}
      profile={
        <UserProfileSection
          user={{
            email: u.email,
            name: u.name,
            gender: (u as { gender?: string | null }).gender ?? null,
            dateOfBirth: (u as { dateOfBirth?: string | null }).dateOfBirth ?? null,
            phoneNumber: (u as { phoneNumber?: string | null }).phoneNumber ?? null,
            postalCode: (u as { postalCode?: string | null }).postalCode ?? null,
            address: (u as { address?: string | null }).address ?? null,
            twoFactorEnabled: (u as { twoFactorEnabled?: boolean | null }).twoFactorEnabled ?? false,
          }}
        />
      }
    />
  )
}
