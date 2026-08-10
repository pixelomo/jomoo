'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/serials', label: 'Library', exact: true },
  { href: '/admin/serials/usage', label: 'Usage details' },
  { href: '/admin/serials/audit', label: 'Audit log' },
]

export default function SerialTabs() {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--line)' }}>
      {TABS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: '10px 0',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              textDecoration: 'none',
              borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
