'use client'

import { useTranslations } from 'next-intl'
import type { MembershipType } from '@/types/membership-signup'

interface Props {
  value?: MembershipType
  onSelect: (type: MembershipType) => void
}

export default function SignUpStep1({ value, onSelect }: Props) {
  const t = useTranslations('auth.membership')

  return (
    <div className="account-choice">
      {(['corporate', 'individual'] as const).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          aria-pressed={value === type}
          className={`account-choice__option${value === type ? ' is-selected' : ''}`}
        >
          {t(type)}
        </button>
      ))}
    </div>
  )
}
