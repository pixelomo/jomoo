'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import SignUpField from './SignUpField'
import NextCaret from './NextCaret'
import type { MembershipType } from '@/types/membership-signup'

interface Props {
  value?: MembershipType
  onSubmit: (type: MembershipType) => void
}

export default function SignUpStep1({ value, onSubmit }: Props) {
  const t = useTranslations('auth.membership')
  const [selected, setSelected] = useState<MembershipType | ''>(value ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      setError(t('errors.required'))
      return
    }
    onSubmit(selected)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <section className="signup__section">
        <h2 className="signup__legend">{t('typeSection')}</h2>

        <SignUpField label={t('typeLabel')} htmlFor="membershipType" error={error ?? undefined}>
          <select
            id="membershipType"
            className="account-select signup__select"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value as MembershipType)
              setError(null)
            }}
          >
            <option value="">{t('selectPlaceholder')}</option>
            <option value="corporate">{t('corporate')}</option>
            <option value="individual">{t('individual')}</option>
          </select>
        </SignUpField>
      </section>

      <div className="signup__actions">
        <button type="submit" className="signup__next">
          <span>{t('next')}</span>
          <NextCaret />
        </button>
      </div>
    </form>
  )
}
