'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'

interface Props {
  productsLabel: string
  spacesLabel: string
  technologyLabel: string
  styleLabel: string
  showroomLabel: string
  supportLabel: string
  brandLabel: string
  registerLabel: string
  signInLabel: string
  signUpLabel: string
  dashboardLabel: string
  signOutLabel: string
  consultationLabel: string
}

export default function MobileMenu({
  productsLabel,
  spacesLabel,
  technologyLabel,
  styleLabel,
  showroomLabel,
  supportLabel,
  brandLabel,
  registerLabel,
  signInLabel,
  signUpLabel,
  dashboardLabel,
  signOutLabel,
  consultationLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useClerk()
  const close = () => setOpen(false)

  const navItems = [
    { href: '/products/smart-toilet', label: productsLabel },
    { href: '#',                      label: spacesLabel    },
    { href: '#',                      label: technologyLabel },
    { href: '#',                      label: styleLabel     },
    { href: '#',                      label: showroomLabel  },
    { href: '#',                      label: supportLabel   },
    { href: '#',                      label: brandLabel     },
  ]

  return (
    <>
      <button
        type="button"
        className="jm-hamburger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {open
            ? <path d="M18 6L6 18M6 6l12 12" />
            : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--paper)',
          zIndex: 100,
          borderTop: '1px solid var(--line)',
          borderBottom: '2px solid var(--accent)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ padding: '8px 0' }}>
            {navItems.map(({ href, label }) => (
              <Link
                key={href + label}
                href={href}
                onClick={close}
                style={{
                  color: 'var(--ink)',
                  fontSize: 15,
                  fontWeight: 500,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--line-2)',
                  display: 'block',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-soft)' }}>
            <Link href="/register" onClick={close} style={{ background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 16px', textDecoration: 'none', display: 'inline-block' }}>
              {consultationLabel} →
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={close} style={{ color: 'var(--ink-2)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  {dashboardLabel}
                </Link>
                <button
                  type="button"
                  onClick={() => { signOut(); close() }}
                  style={{ color: 'var(--ink-3)', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {signOutLabel}
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={close} style={{ color: 'var(--ink-2)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  {signInLabel}
                </Link>
                <Link href="/sign-up" onClick={close} style={{ color: 'var(--ink-2)', fontSize: 13, textDecoration: 'none' }}>
                  {signUpLabel}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
