import { type ReactNode } from 'react'

interface SignUpFieldProps {
  label: string
  /** Draws the blue 必須 marker. Purely the label — validation lives in the schema. */
  required?: boolean
  error?: string
  children: ReactNode
  htmlFor?: string
}

/** A label-left / control-right row, the same shape as the 登録情報変更 form's
 *  rows so the two read as one design. Deliberately not @/components/ui/FormField,
 *  which stacks its label above the control and is used by four other forms. */
export default function SignUpField({
  label,
  required,
  error,
  children,
  htmlFor,
}: SignUpFieldProps) {
  return (
    <div className="account-field">
      <label className="account-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="account-required">必須</span>}
      </label>
      <div className="account-field__control">
        {children}
        {error && (
          <p className="signup__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
