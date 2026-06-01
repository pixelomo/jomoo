'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function SignOutBtn({ children, style, className }: Props) {
  const router = useRouter()
  return (
    <button
      type="button"
      style={style}
      className={className}
      onClick={async () => {
        await authClient.signOut()
        router.push('/')
        router.refresh()
      }}
    >
      {children}
    </button>
  )
}
