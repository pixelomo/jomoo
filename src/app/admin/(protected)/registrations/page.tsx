import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Link from 'next/link'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'warranty', label: 'With Warranty' },
  { key: 'no_warranty', label: 'No Warranty' },
]

const STATUS_MAP: Record<string, string> = {
  warranty: 'REGISTERED_WITH_WARRANTY',
  no_warranty: 'REGISTERED_NO_WARRANTY',
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { filter = 'all', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 20
  const offset = (page - 1) * limit
  const statusFilter = STATUS_MAP[filter]

  const query = db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
      userId: productRegistration.userId,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .orderBy(desc(productRegistration.submittedAt))
    .limit(limit)
    .offset(offset)

  const rows = statusFilter
    ? await query.where(eq(productRegistration.status, statusFilter))
    : await query

  const countQuery = db.select({ total: sql<number>`count(*)::int` }).from(productRegistration)
  const [{ total }] = statusFilter
    ? await countQuery.where(eq(productRegistration.status, statusFilter))
    : await countQuery

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Registrations</h1>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{total} total</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {FILTERS.map(f => (
          <Link
            key={f.key}
            href={`/admin/registrations?filter=${f.key}`}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: filter === f.key ? 600 : 400,
              color: filter === f.key ? 'var(--accent)' : 'var(--ink-3)',
              background: filter === f.key ? 'var(--accent-soft)' : 'transparent',
              border: filter === f.key ? '1px solid #b3ceff' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </Link>
        ))}
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
              {['User', 'Model', 'Serial Number', 'Submitted', 'Warranty Expires', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No registrations found</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/users/${r.userId}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.userName ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.userEmail}</div>
                  </Link>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.modelName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', fontFamily: 'monospace', fontSize: 12 }}>{r.serialNumber}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.warrantyExpiry ? new Date(r.warrantyExpiry).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/registrations/${r.id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
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
              <Link href={`/admin/registrations?filter=${filter}&page=${page - 1}`} style={pageBtnStyle}>← Prev</Link>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            {page * limit < total && (
              <Link href={`/admin/registrations?filter=${filter}&page=${page + 1}`} style={pageBtnStyle}>Next →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    REGISTERED_WITH_WARRANTY: { bg: '#e8f5e9', color: '#2e7d32', label: 'With Warranty' },
    REGISTERED_NO_WARRANTY:   { bg: '#fff8e1', color: '#f57f17', label: 'No Warranty' },
    PENDING:                  { bg: '#e3f2fd', color: '#1565c0', label: 'Pending' },
    RETURNED:                 { bg: '#fce4ec', color: '#c62828', label: 'Returned' },
  }
  const s = map[status] ?? { bg: 'var(--line-2)', color: 'var(--ink-3)', label: status }
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
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
