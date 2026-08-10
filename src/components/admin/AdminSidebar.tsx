'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/users', label: 'Users', icon: '⊙' },
  { href: '/admin/registrations', label: 'Registrations', icon: '≡' },
  { href: '/admin/serials', label: 'Serial Numbers', icon: '⌗' },
  { href: '/admin/warranties', label: 'Warranties', icon: '◈' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '✉' },
  { href: '/admin/notifications', label: 'Emails', icon: '⚙' },
]

export default function AdminSidebar({
  username,
  roleLabel,
}: {
  username?: string
  roleLabel?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
          Admin Portal
        </p>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
          JOMOO
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 6,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {username && (
          // Which role is signed in decides whether the export and delete
          // buttons appear at all, so it has to be visible somewhere — otherwise
          // a missing button looks like a bug rather than a permission.
          <div style={{ padding: '0 12px 12px' }}>
            <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              {username}
            </span>
            <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {roleLabel}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 6,
            fontSize: 14,
            color: 'rgba(255,255,255,0.45)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: 16 }}>⏻</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
