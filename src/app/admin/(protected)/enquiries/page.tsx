import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactSubmission } from '@/lib/db/schema'
import { categoryLabel, type ContactCategory } from '@/types/contact'
import DownloadButton from '@/components/admin/DownloadButton'

export const metadata = { title: 'Enquiries | JOMOO Admin' }

export default async function EnquiriesPage() {
  const rows = await db
    .select()
    .from(contactSubmission)
    .orderBy(desc(contactSubmission.submittedAt))
    .limit(200)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          Contact Enquiries
        </h1>
        <DownloadButton href="/api/admin/export/contact" label="Download CSV" />
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Received', 'Category', 'Name', 'Email', 'Message', 'Sent'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No enquiries yet
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {new Date(r.submittedAt).toLocaleString('ja-JP')}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>
                  {categoryLabel(r.category as ContactCategory)}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>
                  {r.lastName} {r.firstName}
                  {r.companyName && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.companyName}</div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)', maxWidth: 380 }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.message}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: r.delivered ? '#e8f5e9' : '#fce4ec',
                    color: r.delivered ? '#2e7d32' : '#c62828',
                  }}>
                    {r.delivered ? 'Sent' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
