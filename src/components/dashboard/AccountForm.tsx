'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { JP_PREFECTURES } from '@/data/jp-prefectures'
import AccountField from '@/components/ui/AccountField'
import './member-portal.css'

export interface AccountValues {
  email: string
  companyName: string
  companyNameKana: string
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  postalCode: string
  prefecture: string
  city: string
  streetAddress: string
  building: string
}

const REQUIRED: (keyof AccountValues)[] = [
  'email',
  'companyName',
  'lastName',
  'firstName',
  'lastNameKana',
  'firstNameKana',
  'postalCode',
  'prefecture',
  'city',
  'streetAddress',
]

export default function AccountForm({ initial }: { initial: AccountValues }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [values, setValues] = useState(initial)
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set =
    (key: keyof AccountValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const missing = REQUIRED.filter((k) => !values[k].trim())
    if (missing.length) {
      setError('必須項目をすべてご入力ください。')
      return
    }

    const changingPassword = Boolean(password.next || password.confirm)
    if (changingPassword) {
      if (password.next !== password.confirm) {
        setError('パスワードが一致しません。')
        return
      }
      if (password.next.length < 8) {
        setError('パスワードは8桁以上にしてください。')
        return
      }
      if (!password.current) {
        setError('パスワードを変更するには、現在のパスワードをご入力ください。')
        return
      }
    }

    setSaving(true)

    // Name is what Better Auth shows elsewhere, so keep it in step with 姓/名.
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...Object.fromEntries(
          (Object.keys(values) as (keyof AccountValues)[])
            .filter((k) => k !== 'email')
            .map((k) => [k, values[k].trim() || null])
        ),
        name: `${values.lastName.trim()} ${values.firstName.trim()}`.trim(),
      }),
    })

    if (!res.ok) {
      setError('保存に失敗しました。もう一度お試しください。')
      setSaving(false)
      return
    }

    if (changingPassword) {
      const { error: pwError } = await authClient.changePassword({
        currentPassword: password.current,
        newPassword: password.next,
      })
      if (pwError) {
        setError('現在のパスワードが正しくありません。その他の変更は保存されました。')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    startTransition(() => {
      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="account-page">
    <form className="account-form" onSubmit={submit}>
      <h2 className="account-form__title">登録情報変更</h2>

      <section className="account-form__section">
        <h3 className="account-form__legend">会員情報登録</h3>

        <AccountField label="メールアドレス" required>
          {/* Sign-in identity — changing it needs re-verification, so it is shown read-only. */}
          <input className="account-input" type="email" value={values.email} readOnly placeholder="例）example@jomoo.com" />
        </AccountField>

        <AccountField label="会社名" required>
          <input className="account-input" value={values.companyName} onChange={set('companyName')} placeholder="会社名を入力" />
        </AccountField>

        <AccountField label="会社名フリガナ">
          <input className="account-input" value={values.companyNameKana} onChange={set('companyNameKana')} placeholder="会社名のフリガナを入力" />
        </AccountField>

        <AccountField label="担当者名" required>
          <div className="account-field__pair">
            <input className="account-input" value={values.lastName} onChange={set('lastName')} placeholder="姓を入力" />
            <input className="account-input" value={values.firstName} onChange={set('firstName')} placeholder="名を入力" />
          </div>
        </AccountField>

        <AccountField label="担当者名フリガナ" required>
          <div className="account-field__pair">
            <input className="account-input" value={values.lastNameKana} onChange={set('lastNameKana')} placeholder="セイを入力" />
            <input className="account-input" value={values.firstNameKana} onChange={set('firstNameKana')} placeholder="メイを入力" />
          </div>
        </AccountField>
      </section>

      <section className="account-form__section">
        <h3 className="account-form__legend">住所登録</h3>

        <AccountField label="郵便番号" required>
          <input className="account-input" inputMode="numeric" value={values.postalCode} onChange={set('postalCode')} placeholder="例）0123456" />
        </AccountField>

        <AccountField label="住所" required>
          <select className="account-select" value={values.prefecture} onChange={set('prefecture')}>
            <option value="">選択してください</option>
            {JP_PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </AccountField>

        <AccountField label="市区町村" required>
          <input className="account-input" value={values.city} onChange={set('city')} placeholder="市区町村を入力" />
        </AccountField>

        <AccountField label="番地" required>
          <input className="account-input" value={values.streetAddress} onChange={set('streetAddress')} placeholder="番地を入力" />
        </AccountField>

        <AccountField label="建物名・号室など">
          <input className="account-input" value={values.building} onChange={set('building')} placeholder="建物名・号室などを入力" />
        </AccountField>
      </section>

      <section className="account-form__section">
        <h3 className="account-form__legend">パスワード</h3>

        <AccountField label="現在のパスワード">
          <input className="account-input" type="password" autoComplete="current-password" value={password.current} onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))} placeholder="変更する場合のみご入力ください" />
        </AccountField>

        <AccountField
          label="パスワード"
          required
          note={
            <>
              ※パスワードは、大文字、小文字、数字もしくは記号を含めてください。
              <br />
              ※パスワードは、8桁以上にしてください。
            </>
          }
        >
          <input className="account-input" type="password" autoComplete="new-password" value={password.next} onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))} placeholder="パスワードを入力" />
        </AccountField>

        <AccountField label="パスワード(確認用)" required>
          <input className="account-input" type="password" autoComplete="new-password" value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} placeholder="パスワードを入力" />
        </AccountField>
      </section>

      {error && <p className="account-error" role="alert">{error}</p>}

      <div className="account-form__actions">
        <button type="submit" className="member-btn" disabled={saving}>
          {saving ? '保存中…' : '登録情報変更'}
        </button>
      </div>
    </form>
    </div>
  )
}
