import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { getProductModels } from '@/lib/sanity'
import { listBranchOptions } from '@/lib/dealerBranches'
import RegistrationForm from '@/components/registration/RegistrationForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ auto?: string }>
}) {
  const { auto } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const t = await getTranslations('registration')
  const [models, dealers] = await Promise.all([getProductModels(), listBranchOptions()])

  // The hero in the shared layout already says マイページ, so this page leads
  // with what it is for rather than repeating it.
  return (
    <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-zinc-500 mt-1">{t('subtitle')}</p>
        {auto === 'true' && (
          <p className="mt-3 rounded-md bg-[#73a4c7]/10 border border-[#73a4c7]/30 px-4 py-2.5 text-sm text-zinc-700">
            {t('auto.banner')}
          </p>
        )}
      </div>
      <RegistrationForm models={models} dealers={dealers} auto={auto === 'true'} />
    </main>
  )
}
