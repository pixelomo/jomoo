import { headers } from 'next/headers'
import JomooNav from '@/components/layout/JomooNav'
import JomooFooter from '@/components/layout/JomooFooter'
import { auth } from '@/lib/auth'
import '@/components/layout/jomoo-chrome.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <JomooNav isSignedIn={Boolean(session?.user)} />
      <div className="site-main">
        {children}
      </div>
      <JomooFooter />
    </>
  )
}
