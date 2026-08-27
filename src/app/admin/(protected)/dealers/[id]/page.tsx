import { db } from '@/lib/db'
import { dealerBranch, productRegistration, user, warrantyRecord } from '@/lib/db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MemberTypeBadge from '@/components/admin/MemberTypeBadge'

const cell: React.CSSProperties = { padding: '12px 16px', color: 'var(--ink-2)' }
const head: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--ink-3)',
  fontSize: 12,
}
const card: React.CSSProperties = {
  background: 'var(--paper)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  overflowX: 'auto',
}

/**
 * One dealer: the accounts that belong to it, and every registration filed
 * against it split by the customer who filed it — the same list the dealer
 * sees on their own マイページ, so a support call can be answered from either
 * side without the two disagreeing.
 */
export default async function AdminDealerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [branch] = await db.select().from(dealerBranch).where(eq(dealerBranch.id, id)).limit(1)
  if (!branch) notFound()

  const [accounts, registrations] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        memberType: user.memberType,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.branchId, id))
      .orderBy(asc(user.createdAt)),

    db
      .select({
        id: productRegistration.id,
        modelName: productRegistration.modelName,
        serialNumber: productRegistration.serialNumber,
        status: productRegistration.status,
        submittedAt: productRegistration.submittedAt,
        warrantyExpiry: warrantyRecord.expiryDate,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerType: user.memberType,
      })
      .from(productRegistration)
      .innerJoin(user, eq(user.id, productRegistration.userId))
      .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
      .where(eq(productRegistration.branchId, id))
      .orderBy(asc(user.name), asc(user.id), desc(productRegistration.submittedAt)),
  ])

  // Grouped in one pass off an ordered query rather than a query per customer —
  // a busy branch would otherwise be one round trip per person on the list.
  const groups: {
    customerId: string
    customerName: string
    customerEmail: string
    customerType: string | null
    rows: typeof registrations
  }[] = []

  for (const row of registrations) {
    const last = groups[groups.length - 1]
    if (last && last.customerId === row.customerId) {
      last.rows.push(row)
      continue
    }
    groups.push({
      customerId: row.customerId,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerType: row.customerType,
      rows: [row],
    })
  }

  const address =
    [branch.prefecture, branch.city, branch.streetAddress, branch.building]
      .filter(Boolean)
      .join(' ') || null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link href="/admin/dealers" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>
          ← Dealers
        </Link>
        <span style={{ color: 'var(--line)', fontSize: 16 }}>/</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{branch.name}</h1>
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        {branch.postalCode ? `〒${branch.postalCode}　` : ''}
        {address ?? 'No address on file'}
        {branch.nameKana ? `　·　${branch.nameKana}` : ''}
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <Stat label="Accounts" value={accounts.length} />
        <Stat label="Customers" value={groups.length} />
        <Stat label="Registrations" value={registrations.length} />
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>
        Accounts at this dealer
      </h2>
      <div style={{ ...card, marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Name', 'Email', 'Type', 'Joined', ''].map(h => <th key={h} style={head}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: 'center', color: 'var(--ink-3)', padding: '28px 16px' }}>
                  No accounts linked to this dealer
                </td>
              </tr>
            )}
            {accounts.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ ...cell, fontWeight: 500, color: 'var(--ink)' }}>{a.name}</td>
                <td style={cell}>{a.email}</td>
                <td style={cell}><MemberTypeBadge type={a.memberType} /></td>
                <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {new Date(a.createdAt).toLocaleDateString('en-AU')}
                </td>
                <td style={cell}>
                  <Link href={`/admin/users/${a.id}`} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>
        Registrations by customer
      </h2>

      {groups.length === 0 ? (
        <div style={{ ...card, padding: '28px 16px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          Nothing registered against this dealer yet. A registration is linked when the customer
          picks this branch from the 販売店 list.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groups.map(group => (
            <div key={group.customerId} style={card}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                padding: '12px 16px',
                borderBottom: '1px solid var(--line)',
                background: 'var(--bg-soft)',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>{group.customerName}</span>
                <MemberTypeBadge type={group.customerType} />
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{group.customerEmail}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 'auto' }}>
                  {group.rows.length} registration{group.rows.length === 1 ? '' : 's'}
                </span>
                <Link href={`/admin/users/${group.customerId}`} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}>
                  Customer →
                </Link>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line-2)' }}>
                    {['Model', 'Serial', 'Status', 'Submitted', 'Warranty', ''].map(h => <th key={h} style={head}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                      <td style={{ ...cell, fontWeight: 500, color: 'var(--ink)' }}>{r.modelName}</td>
                      <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12 }}>{r.serialNumber}</td>
                      <td style={cell}>{r.status}</td>
                      <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                        {new Date(r.submittedAt).toLocaleDateString('en-AU')}
                      </td>
                      <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                        {r.warrantyExpiry ? new Date(r.warrantyExpiry).toLocaleDateString('en-AU') : '—'}
                      </td>
                      <td style={cell}>
                        <Link href={`/admin/registrations/${r.id}`} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: '14px 20px',
      minWidth: 120,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{label}</div>
    </div>
  )
}
