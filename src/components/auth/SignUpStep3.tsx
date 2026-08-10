'use client'

import { useTranslations } from 'next-intl'

/** 登録完了. The account already exists by the time this renders — step 2's
 *  次へ creates it — so there is nothing to confirm and nothing to submit. */
export default function SignUpStep3() {
  const t = useTranslations('auth.membership')

  return (
    <div className="signup__complete">
      <p>{t('completeThanks')}</p>
      <p>{t('completeClosing')}</p>
    </div>
  )
}
