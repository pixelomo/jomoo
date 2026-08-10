import Link from 'next/link'
import SerialImportForm from '@/components/admin/SerialImportForm'

export const metadata = { title: 'Import Serial Numbers | JOMOO Admin' }

export default function SerialImportPage() {
  return (
    <div>
      <Link
        href="/admin/serials"
        style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}
      >
        ← Serial numbers
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '12px 0 8px' }}>
        Import serial numbers
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 24px', maxWidth: 640, lineHeight: 1.6 }}>
        Add a batch from the factory. Check the file first to see what will happen — nothing is
        written until you press Import, and serials already in the library are never overwritten.
      </p>

      <SerialImportForm />
    </div>
  )
}
