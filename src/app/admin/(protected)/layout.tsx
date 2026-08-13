import { redirect } from 'next/navigation'
import { getAdminSession, ROLE_LABELS } from '@/lib/admin-auth'
import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import '@/components/admin/admin-chrome.css'

export default async function AdminPortalLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="admin-shell">
      <AdminSidebar username={session.username} roleLabel={ROLE_LABELS[session.role]} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
