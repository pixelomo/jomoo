import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration, user as userTable, warrantyRecord } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getBranch } from '@/lib/dealerBranches'
import { getBranchRegistrations } from '@/lib/branchRegistrations'
import MemberTabs from '@/components/dashboard/MemberTabs'
import BranchRegistrations from '@/components/dashboard/BranchRegistrations'
import UserProfileSection from '@/components/dashboard/UserProfileSection'
import RegistrationCard from '@/components/dashboard/RegistrationCard'
import WarrantySummary from '@/components/dashboard/WarrantySummary'
import type { DbProductRegistration } from '@/types/database'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const u = session.user

  // Read the membership from the row rather than the session: branch_id is
  // written by the sign-up hook after the session was minted, so a session
  // issued at sign-up still carries none.
  const [member] = await db
    .select({ memberType: userTable.memberType, branchId: userTable.branchId })
    .from(userTable)
    .where(eq(userTable.id, u.id))
    .limit(1)

  const isCorporate = member?.memberType === 'corporate'

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

  // One lookup for the card's 保証期間 row, rather than a second query per
  // registration — the warranties are already in hand.
  const expiryByRegistration = new Map(warranties.map((w) => [w.registrationId, w.expiryDate]))

  // Only fetched for a dealer, and only once their account has a branch — the
  // tab is what carries the whole feature, so it is absent rather than empty
  // for everybody else.
  const [branch, branchGroups] =
    isCorporate && member?.branchId
      ? await Promise.all([getBranch(member.branchId), getBranchRegistrations(member.branchId)])
      : [null, null]

  return (
    <MemberTabs
      productCount={registrations.length}
      products={registrations.map((reg) => (
        <RegistrationCard
          key={reg.id}
          registration={reg as unknown as DbProductRegistration}
          warrantyExpiry={expiryByRegistration.get(reg.id) ?? null}
        />
      ))}
      branch={
        isCorporate ? (
          <BranchRegistrations
            branchName={branch?.name ?? null}
            hasBranch={Boolean(member?.branchId)}
            groups={branchGroups ?? []}
          />
        ) : undefined
      }
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
            address:
              [
                (u as { prefecture?: string | null }).prefecture,
                (u as { city?: string | null }).city,
                (u as { streetAddress?: string | null }).streetAddress,
                (u as { building?: string | null }).building,
              ]
                .filter(Boolean)
                .join(' ') || null,
            twoFactorEnabled: (u as { twoFactorEnabled?: boolean | null }).twoFactorEnabled ?? false,
          }}
        />
      }
    />
  )
}
