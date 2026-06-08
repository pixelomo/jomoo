import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminPortalLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      background: 'var(--bg-soft)',
    }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 40px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
