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
    serialNumber: string
    purchaseDate: string
    installationDate: string
    warrantyExpiry: string
    issuedOn: string
    print: string
  }
}

export default function WarrantyCard({ registration, warranty, customerName, t }: Props) {
  const handlePrint = () => window.print()

  const certNo = registration.id.slice(0, 8).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Print button */}
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

      {/* Card */}
      <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm print:border-none print:shadow-none">
        {/* Brand header bar */}
        <div className="bg-zinc-900 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-zinc-400 uppercase mb-0.5">JOMOO</p>
            <h1 className="text-white font-semibold text-lg">{t.cardTitle}</h1>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs">No.</p>
            <p className="font-mono text-sm text-zinc-300">{certNo}</p>
          </div>
        </div>

        {/* Warranty expiry highlight strip */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-8 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">{t.warrantyExpiry}</p>
            <p className="text-2xl font-bold text-zinc-900">{formatDate(warranty.expiryDate)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        </div>

        {/* Fields */}
        <div className="px-8 py-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <CardField label={t.product} value={registration.modelName} />
            <CardField label={t.customerName} value={customerName} />
            <CardField label={t.serialNumber} value={registration.serialNumber} mono />
            <CardField label={t.purchaseDate} value={registration.purchaseDate ? formatDate(registration.purchaseDate) : '—'} />
            <CardField label={t.installationDate} value={formatDate(registration.installationDate)} />
            <CardField
              label={t.issuedOn}
              value={formatDate(warranty.createdAt)}
            />
          </dl>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">{t.registrationId}</p>
            <p className="font-mono text-xs text-zinc-500 break-all">{registration.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardField({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd
        className={[
          'mt-1 text-sm font-medium text-zinc-800',
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
