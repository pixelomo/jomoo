import { type ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  requiredBadge?: boolean
  error?: string
  hint?: string
  children: ReactNode
  htmlFor?: string
}

export default function FormField({
  label,
  required,
  requiredBadge,
  error,
  hint,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-zinc-700"
        >
          {label}
          {required && !requiredBadge && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {requiredBadge && (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#73a4c7] bg-[#73a4c7]/12">
            必須
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-xs text-zinc-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Shared input / select / textarea class strings
export const inputClass =
  'block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400'
