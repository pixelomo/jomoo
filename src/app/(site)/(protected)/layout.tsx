import type { ReactNode } from 'react'
import MemberHero from '@/components/dashboard/MemberHero'

/**
 * The dashboard, product registration and warranty views are all "マイページ",
 * so the banner lives here rather than being repeated in each page.
 */
export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="member">
      <MemberHero />
      {children}
    </div>
  )
}
