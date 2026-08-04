import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AccountForm, { type AccountValues } from '@/components/dashboard/AccountForm'

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const u = session.user as Record<string, unknown>
  const str = (key: string) => (typeof u[key] === 'string' ? (u[key] as string) : '')

  const initial: AccountValues = {
    email: session.user.email,
    companyName: str('companyName'),
    companyNameKana: str('companyNameKana'),
    lastName: str('lastName'),
    firstName: str('firstName'),
    lastNameKana: str('lastNameKana'),
    firstNameKana: str('firstNameKana'),
    postalCode: str('postalCode'),
    prefecture: str('prefecture'),
    city: str('city'),
    streetAddress: str('streetAddress'),
    building: str('building'),
  }

  return <AccountForm initial={initial} />
}
