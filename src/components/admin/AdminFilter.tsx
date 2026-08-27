'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export interface FilterOption {
  value: string
  label: string
}

/**
 * A select that writes one search param, the way AdminSearch writes `q`.
 *
 * Reads the current value out of the URL rather than holding its own state, so
 * the back button and a shared link both land on the filter that was applied.
 */
export default function AdminFilter({
  param,
  label,
  options,
  allLabel = 'All',
}: {
  param: string
  label: string
  options: FilterOption[]
  /** Wording for the empty value — 'All types', 'All dealers'. */
  allLabel?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const value = searchParams.get(param) ?? ''

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) params.set(param, e.target.value)
    else params.delete(param)
    // Page 3 of the old filter is rarely page 3 of the new one.
    params.delete('page')
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{label}</span>
      <select
        value={value}
        onChange={handleChange}
        style={{
          padding: '8px 12px',
          border: '1px solid var(--line)',
          borderRadius: 7,
          fontSize: 13,
          color: 'var(--ink)',
          background: 'var(--paper)',
          outline: 'none',
          maxWidth: 220,
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
