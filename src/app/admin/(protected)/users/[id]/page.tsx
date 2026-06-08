import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminUserEditForm from '@/components/admin/AdminUserEditForm'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [u] = await db.select().from(user).where(eq(user.id, id)).limit(1)
  if (!u) notFound()

  const registrations = await db
    .select({
      id: productRegistration.id,
      modelName: productRegistration.modelName,
      serialNumber: productRegistration.serialNumber,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      installationDate: productRegistration.installationDate,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.userId, id))
    .orderBy(desc(productRegistration.submittedAt))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/users" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>← Users</Link>
        <span style={{ color: 'var(--line)', fontSize: 16 }}>/</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{u.name}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Edit form */}
        <AdminUserEditForm userId={u.id} initial={{
          name: u.name,
          email: u.email,
          gender: (u as { gender?: string | null }).gender ?? null,
          dateOfBirth: (u as { dateOfBirth?: string | null }).dateOfBirth ?? null,
        }} />

        {/* Meta */}
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '24px',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>Account Info</h2>
          <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'User ID', value: u.id },
              { label: 'Joined', value: new Date(u.createdAt).toLocaleDateString('en-AU') },
              { label: 'Email verified', value: u.emailVerified ? 'Yes' : 'No' },
              { label: '2FA', value: (u as { twoFactorEnabled?: boolean | null }).twoFactorEnabled ? 'Enabled' : 'Disabled' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <dt style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{label}</dt>
                <dd style={{ margin: 0, color: 'var(--ink-2)', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Registrations */}
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 24,
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            Registrations ({registrations.length})
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Model', 'Serial', 'Installed', 'Warranty Expires', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No registrations</td></tr>
            )}
            {registrations.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--ink)' }}>{r.modelName}</td>
                <td style={{ padding: '11px 16px', color: 'var(--ink-3)', fontFamily: 'monospace', fontSize: 12 }}>{r.serialNumber}</td>
                <td style={{ padding: '11px 16px', color: 'var(--ink-3)' }}>
                  {r.installationDate ? new Date(r.installationDate).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '11px 16px', color: 'var(--ink-3)' }}>
                  {r.warrantyExpiry ? new Date(r.warrantyExpiry).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <Link href={`/admin/registrations/${r.id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                    View →
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
