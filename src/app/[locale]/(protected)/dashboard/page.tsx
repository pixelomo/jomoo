import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase'
import type { DbProductRegistration, DbUser } from '@/types/database'
import Link from 'next/link'
import UserProfileSection from '@/components/dashboard/UserProfileSection'
import RegistrationCard from '@/components/dashboard/RegistrationCard'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('dashboard')
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, email, nickname, gender, date_of_birth')
    .eq('clerk_id', userId)
    .single()

  let registrations: DbProductRegistration[] = []
  if (user) {
    const { data } = await supabase
      .from('product_registrations')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
    registrations = data ?? []
  }

  return (
    <main className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {user?.nickname && (
          <p className="text-zinc-500 mt-1">{t('welcome')}，{user.nickname}</p>
        )}
      </div>

      {user && (
        <UserProfileSection
          user={user as Pick<DbUser, 'email' | 'nickname' | 'gender' | 'date_of_birth'>}
        />
      )}

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
            <Link
              href="/register"
              className="mt-4 inline-flex items-center text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              {t('registerFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <RegistrationCard key={reg.id} registration={reg} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
