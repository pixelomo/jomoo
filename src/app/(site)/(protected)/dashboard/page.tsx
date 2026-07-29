import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productRegistration } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import UserProfileSection from '@/components/dashboard/UserProfileSection'
import RegistrationCard from '@/components/dashboard/RegistrationCard'
import type { DbProductRegistration } from '@/types/database'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const t = await getTranslations('dashboard')
  const u = session.user

  const registrations = await db
    .select()
    .from(productRegistration)
    .where(eq(productRegistration.userId, u.id))
    .orderBy(desc(productRegistration.submittedAt))

  return (
    <main className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {u.name && (
          <p className="text-zinc-500 mt-1">{t('welcome')}，{u.name}</p>
        )}
      </div>

      <UserProfileSection
        user={{
          email: u.email,
          name: u.name,
          gender: (u as { gender?: string | null }).gender ?? null,
          dateOfBirth: (u as { dateOfBirth?: string | null }).dateOfBirth ?? null,
          twoFactorEnabled: (u as { twoFactorEnabled?: boolean | null }).twoFactorEnabled ?? false,
        }}
      />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('myProducts')}</h2>
          <Link
            href="/register"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + {t('registerFirst')}
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 px-8 py-16 text-center">
            <p className="text-zinc-500">{t('noProducts')}</p>
            <Link href="/register" className="mt-4 inline-flex items-center text-sm font-medium text-zinc-900 underline-offset-4 hover:underline">
              {t('registerFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <RegistrationCard key={reg.id} registration={reg as unknown as DbProductRegistration} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
