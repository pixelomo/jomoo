'use client'

import { useTranslations } from 'next-intl'

/** 登録完了. The account already exists by the time this renders — step 2's
 *  次へ creates it — so there is nothing to confirm and nothing to submit. */
export default function SignUpStep3({ isPartner = false }: { isPartner?: boolean }) {
  const t = useTranslations('auth.membership')

  return (
    <div className="signup__complete">
      <p>{t('completeThanks')}</p>
      <p>{t('completeClosing')}</p>
      {/* A partner account exists now but is not yet a dealer — say so here,
          where they are looking, rather than leave them to find it out. */}
      {isPartner && (
        <div className="signup__partner-notice" role="status">
          <p className="signup__partner-notice-title">{t('partnerCompleteTitle')}</p>
          <p>{t('partnerCompleteBody')}</p>
        </div>
      )}
    </div>
  )
}
