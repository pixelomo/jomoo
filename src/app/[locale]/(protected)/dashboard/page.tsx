import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase'
import type { DbProductRegistration } from '@/types/database'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('dashboard')

  const supabase = createAdminClient()

  // Look up the internal user record by clerk_id
  const { data: user } = await supabase
    .from('users')
    .select('id, nickname')
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
          <p className="text-zinc-500 mt-1">
            {t('welcome')}，{user.nickname}
          </p>
        )}
      </div>

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
              <div
                key={reg.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{reg.model_name}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {reg.installation_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={reg.status} label={t(`status.${reg.status}`)} />
                    {reg.status === 'REGISTERED_WITH_WARRANTY' && (
                      <Link
                        href={`/warranty/${reg.id}`}
                        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
                      >
                        {t('viewWarranty')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colours: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    RETURNED: 'bg-red-50 text-red-700 border-red-200',
    REGISTERED_NO_WARRANTY: 'bg-green-50 text-green-700 border-green-200',
    REGISTERED_WITH_WARRANTY: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colours[status] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
    >
      {label}
    </span>
  )
}
