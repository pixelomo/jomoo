'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './admin-chrome.css'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/users', label: 'Users', icon: '⊙' },
  { href: '/admin/dealers', label: 'Dealers', icon: '⌂' },
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
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            margin: '0 0 4px',
          }}
        >
          Admin Portal
        </p>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
          JOMOO
        </span>
      </div>

      <nav className="admin-sidebar__nav">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`admin-sidebar__link${active ? ' is-active' : ''}`}
            >
              <span className="admin-sidebar__icon">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar__foot">
        {username && (
          // Which role is signed in decides whether the export and delete
          // buttons appear at all, so it has to be visible somewhere —
          // otherwise a missing button looks like a bug rather than a
          // permission.
          <div className="admin-sidebar__who">
            <span className="admin-sidebar__name">{username}</span>
            <span className="admin-sidebar__role">{roleLabel}</span>
          </div>
        )}
        <button onClick={handleLogout} className="admin-signout" title="Sign out">
          <span style={{ fontSize: 16 }}>⏻</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
