'use client'

import { useId, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { inputClass } from '@/components/ui/FormField'
import type { BranchOption } from '@/lib/dealerBranches'

/**
 * Folds the differences between two people typing one shop's name — full-width
 * letters, spaces, case, and the 株式会社 / (株) that one writes and one leaves
 * out — so "trust" finds 株式会社TRUST.
 */
function fold(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/株式会社|有限会社|合同会社|\(株\)|\(有\)|㈱|㈲/g, '')
    .replace(/[\s　・.,、。\-ー]/g, '')
}

interface Props {
  id: string
  dealers: BranchOption[]
  name: string
  branchId: string | undefined
  /** branchId is set only when the member picked a registered dealer. */
  onChange: (name: string, branchId: string | undefined) => void
}

/**
 * 販売店 — typed freely, since most shops a customer names have never signed up.
 * Once the text matches a dealer who has, it is offered underneath; picking it
 * links the registration to that branch and fills in its contact details.
 * Typing again unlinks it, so a branch is only ever attached by a deliberate
 * choice — it decides which dealer may read the customer's details.
 */
export default function DealerNameInput({ id, dealers, name, branchId, onChange }: Props) {
  const t = useTranslations('registration.step1')
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selected = branchId ? dealers.find((d) => d.id === branchId) ?? null : null

  const matches = useMemo(() => {
    const q = fold(name)
    // One character matches half the list in Japanese, so wait for two.
    if (q.length < 2 || selected) return []
    return dealers.filter((d) => {
      const n = fold(d.name)
      return n.length > 0 && (n.includes(q) || q.includes(n))
    })
  }, [name, dealers, selected])

  const showList = open && matches.length > 0

  const pick = (dealer: BranchOption) => {
    onChange(dealer.name, dealer.id)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + matches.length) % matches.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(matches[active] ?? matches[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type="text"
          className={inputClass}
          placeholder={t('dealerNamePlaceholder')}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          value={name}
          onChange={(e) => {
            onChange(e.target.value, undefined)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          // Delayed so a click on a suggestion lands before the list closes.
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
        />

        {showList && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg">
            <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">
              {t('dealerSuggestionsTitle')}
            </p>
            <ul id={listId} role="listbox" className="max-h-60 overflow-auto py-1">
              {matches.map((d, i) => (
                <li
                  key={d.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`cursor-pointer px-3 py-2 text-sm ${i === active ? 'bg-zinc-100' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(d)}
                >
                  <span className="font-medium text-zinc-900">{d.name}</span>
                  {d.locality && <span className="ml-2 text-xs text-zinc-500">{d.locality}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Picking a branch fills its address and contact in straight away: the
          customer confirms they chose the right shop before going on, and the
          details they will need for a warranty call are in front of them. */}
      {selected && (
        <dl className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t('dealerDetailsTitle')}
            </p>
            <button
              type="button"
              className="text-xs text-zinc-500 underline hover:text-zinc-800"
              onClick={() => onChange(selected.name, undefined)}
            >
              {t('dealerClear')}
            </button>
          </div>
          <div className="font-medium text-zinc-900">{selected.name}</div>
          {selected.address && (
            <div className="mt-1.5 flex gap-2">
              <dt className="w-12 shrink-0 text-zinc-500">{t('dealerAddress')}</dt>
              <dd className="text-zinc-700">
                {selected.postalCode ? `〒${selected.postalCode} ` : ''}
                {selected.address}
              </dd>
            </div>
          )}
          {selected.phone && (
            <div className="mt-1 flex gap-2">
              <dt className="w-12 shrink-0 text-zinc-500">{t('dealerPhone')}</dt>
              <dd className="text-zinc-700">
                <a href={`tel:${selected.phone}`} className="hover:underline">
                  {selected.phone}
                </a>
              </dd>
            </div>
          )}
          {selected.email && (
            <div className="mt-1 flex gap-2">
              <dt className="w-12 shrink-0 text-zinc-500">{t('dealerEmail')}</dt>
              <dd className="text-zinc-700">
                <a href={`mailto:${selected.email}`} className="hover:underline">
                  {selected.email}
                </a>
              </dd>
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-500">{t('dealerDetailsNote')}</p>
        </dl>
      )}
    </div>
  )
}
