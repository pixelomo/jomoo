import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Link from 'next/link'

function daysUntil(dateStr: string): number {
  const expiry = new Date(dateStr)
  const now = new Date()
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr)
  let bg = '#e8f5e9', color = '#2e7d32', label = `${days}d left`
  if (days < 0) { bg = '#f5f5f5'; color = '#757575'; label = 'Expired' }
  else if (days < 90) { bg = '#fff8e1'; color = '#f57f17' }
  else if (days < 180) { bg = '#fff3e0'; color = '#e65100' }
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>
      {label}
    </span>
  )
}

export default async function AdminWarrantiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 25
  const offset = (page - 1) * limit

  const warranties = await db
    .select({
      id: warrantyRecord.id,
      registrationId: warrantyRecord.registrationId,
      expiryDate: warrantyRecord.expiryDate,
      createdAt: warrantyRecord.createdAt,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      installationDate: productRegistration.installationDate,
      userName: user.name,
      userEmail: user.email,
      userId: productRegistration.userId,
    })
    .from(warrantyRecord)
    .leftJoin(productRegistration, eq(productRegistration.id, warrantyRecord.registrationId))
    .leftJoin(user, eq(user.id, productRegistration.userId))
    .orderBy(desc(warrantyRecord.expiryDate))
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(warrantyRecord)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Warranties</h1>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{total} total</span>
      </div>

      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['User', 'Model', 'Serial Number', 'Installed', 'Expires', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {warranties.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No warranties found</td></tr>
            )}
            {warranties.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{w.userName ?? '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{w.userEmail}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{w.modelName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', fontFamily: 'monospace', fontSize: 12 }}>{w.serialNumber}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {w.installationDate ? new Date(w.installationDate).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                  {new Date(w.expiryDate).toLocaleDateString('en-AU')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <ExpiryBadge dateStr={w.expiryDate} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/registrations/${w.registrationId}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > limit && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {page > 1 && (
              <Link href={`/admin/warranties?page=${page - 1}`} style={pageBtnStyle}>← Prev</Link>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            {page * limit < total && (
              <Link href={`/admin/warranties?page=${page + 1}`} style={pageBtnStyle}>Next →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const pageBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--ink-2)',
  textDecoration: 'none',
  background: 'var(--paper)',
}
