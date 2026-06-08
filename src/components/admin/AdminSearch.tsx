'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export default function AdminSearch({ placeholder }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [, startTransition] = useTransition()

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)
    const params = new URLSearchParams(searchParams.toString())
    if (v) { params.set('q', v); params.delete('page') }
    else params.delete('q')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? 'Search…'}
      style={{
        width: '100%',
        padding: '9px 14px',
        border: '1px solid var(--line)',
        borderRadius: 7,
        fontSize: 14,
        color: 'var(--ink)',
        background: 'var(--paper)',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: 0,
      }}
    />
  )
}
