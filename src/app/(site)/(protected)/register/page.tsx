import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { getProductModels } from '@/lib/sanity'
import RegistrationForm from '@/components/registration/RegistrationForm'

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const t = await getTranslations('registration')
  const models = await getProductModels()

  return (
    <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-zinc-500 mt-1">{t('subtitle')}</p>
      </div>
      <RegistrationForm models={models} />
    </main>
  )
}
