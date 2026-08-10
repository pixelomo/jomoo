import type { ReactNode } from 'react'

/**
 * One labelled row of the member portal's form styling.
 *
 * Lifted out of AccountForm so sign-in, sign-up and 登録情報変更 share a single
 * definition — three copies of the same grid drifted apart the last time the
 * label column changed width.
 */
export default function AccountField({
  label,
  required,
  hint,
  note,
  error,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  /** Short guidance under the input, inside the input column. */
  hint?: ReactNode
  /** Sits below the row and spans the whole form, not just the input column. */
  note?: ReactNode
  error?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="account-field">
      <label className="account-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="account-required">必須</span>}
      </label>
      <div className="account-field__control">
        {children}
        {/* An error replaces the hint rather than stacking under it — two lines
            of small print below one input is where people stop reading. */}
        {error ? (
          <p className="account-error" role="alert">
            {error}
          </p>
        ) : (
          hint && <p className="account-hint">{hint}</p>
        )}
      </div>
      {note && <p className="account-note">{note}</p>}
    </div>
  )
}
