'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'

interface Props {
  productsLabel: string
  registerLabel: string
  signInLabel: string
  signUpLabel: string
  dashboardLabel: string
  signOutLabel: string
}

export default function MobileMenu({
  productsLabel,
  registerLabel,
  signInLabel,
  signUpLabel,
  dashboardLabel,
  signOutLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useClerk()
  const close = () => setOpen(false)

  return (
    <>
      {/* Hamburger button */}
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

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: 'var(--nav-grey)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 24px 24px',
            gap: '0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {[
            { href: '/products/smart-toilet', label: productsLabel },
            { href: '/register',              label: registerLabel  },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 500,
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'block',
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link href="/dashboard" onClick={close} style={{ color: '#fff', fontSize: '14px', fontWeight: 500, padding: '10px 0' }}>
                  {dashboardLabel}
                </Link>
                <button
                  type="button"
                  onClick={() => { signOut(); close() }}
                  style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 0' }}
                >
                  {signOutLabel}
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={close} style={{ color: '#fff', fontSize: '14px', fontWeight: 500, padding: '10px 0' }}>
                  {signInLabel}
                </Link>
                <Link href="/sign-up" onClick={close} style={{
                  color: '#fff', fontSize: '13px', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.6)', padding: '8px 20px',
                  display: 'inline-block',
                }}>
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
