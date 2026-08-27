'use client'

import { authClient } from '@/lib/auth-client'

interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function SignOutBtn({ children, style, className }: Props) {
  return (
    <button
      type="button"
      style={style}
      className={className}
      onClick={async () => {
        await authClient.signOut()
        window.location.assign('/')
      }}
    >
      {children}
    </button>
  )
}
