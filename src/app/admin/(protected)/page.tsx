import { db } from '@/lib/db'
import { user, productRegistration } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Link from 'next/link'

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    REGISTERED_WITH_WARRANTY: { bg: '#e8f5e9', color: '#2e7d32', label: 'With Warranty' },
    REGISTERED_NO_WARRANTY:   { bg: '#fff8e1', color: '#f57f17', label: 'No Warranty' },
    PENDING:                  { bg: '#e3f2fd', color: '#1565c0', label: 'Pending' },
    RETURNED:                 { bg: '#fce4ec', color: '#c62828', label: 'Returned' },
  }
  const s = map[status] ?? { bg: 'var(--line-2)', color: 'var(--ink-3)', label: status }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

export default async function AdminDashboard() {
  const [userRow] = await db.select({ count: sql<number>`count(*)::int` }).from(user)
  const [withWarranty] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productRegistration)
    .where(eq(productRegistration.status, 'REGISTERED_WITH_WARRANTY'))
  const [noWarranty] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productRegistration)
    .where(eq(productRegistration.status, 'REGISTERED_NO_WARRANTY'))

  const recent = await db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .orderBy(desc(productRegistration.submittedAt))
    .limit(10)

  const stats = [
    { label: 'Total Users', value: userRow.count, href: '/admin/users' },
    { label: 'With Warranty', value: withWarranty.count, href: '/admin/registrations?filter=warranty' },
    { label: 'No Warranty', value: noWarranty.count, href: '/admin/registrations?filter=no_warranty' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 28px' }}>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: '24px 24px 20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent registrations */}
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Recent Registrations</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['User', 'Model', 'Serial Number', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No registrations yet</td></tr>
            )}
            {recent.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.userName ?? '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.userEmail}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.modelName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', fontFamily: 'monospace', fontSize: 12 }}>{r.serialNumber}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/registrations/${r.id}`} style={{ textDecoration: 'none' }}>
                    {statusBadge(r.status)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
