'use client'

import type { DbProductRegistration, DbWarrantyRecord } from '@/types/database'

interface Props {
  registration: DbProductRegistration
  warranty: DbWarrantyRecord
  customerName: string
  t: {
    cardTitle: string
    product: string
    registrationId: string
    customerName: string
    installationDate: string
    warrantyExpiry: string
    print: string
  }
}

export default function WarrantyCard({ registration, warranty, customerName, t }: Props) {
  const handlePrint = () => window.print()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Print button - hidden in print */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {t.print}
        </button>
      </div>

      {/* Warranty card - printable */}
      <div className="rounded-xl border-2 border-zinc-200 bg-white p-8 print:border-none print:shadow-none shadow-sm">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-zinc-100">
          <h1 className="text-xl font-bold tracking-wide text-zinc-900">{t.cardTitle}</h1>
        </div>

        {/* Fields */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CardField label={t.product} value={registration.model_name} />
          <CardField label={t.customerName} value={customerName} />
          <CardField label={t.installationDate} value={formatDate(registration.installation_date)} />
          <CardField label={t.warrantyExpiry} value={formatDate(warranty.expiry_date)} highlight />
          <CardField
            label={t.registrationId}
            value={registration.id}
            mono
            className="sm:col-span-2"
          />
        </dl>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-400">
          {formatDate(registration.installation_date)}
        </div>
      </div>
    </div>
  )
}

function CardField({
  label,
  value,
  highlight,
  mono,
  className = '',
}: {
  label: string
  value: string
  highlight?: boolean
  mono?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd
        className={[
          'mt-1 text-sm font-medium',
          highlight ? 'text-zinc-900 text-base' : 'text-zinc-700',
          mono ? 'font-mono text-xs break-all' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
