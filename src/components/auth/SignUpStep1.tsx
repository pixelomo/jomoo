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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onSelect('corporate')}
          className={[
            'flex-1 rounded-xl border-2 px-6 py-5 text-center text-lg font-semibold transition-colors',
            value === 'corporate'
              ? 'border-[#73a4c7] bg-[#73a4c7] text-white'
              : 'border-[#73a4c7] bg-white text-[#73a4c7] hover:bg-[#73a4c7]/5',
          ].join(' ')}
        >
          {t('corporate')}
        </button>
        <button
          type="button"
          onClick={() => onSelect('individual')}
          className={[
            'flex-1 rounded-xl border-2 px-6 py-5 text-center text-lg font-semibold transition-colors',
            value === 'individual'
              ? 'border-[#73a4c7] bg-[#73a4c7] text-white'
              : 'border-[#73a4c7] bg-white text-[#73a4c7] hover:bg-[#73a4c7]/5',
          ].join(' ')}
        >
          {t('individual')}
        </button>
      </div>
    </div>
  )
}
