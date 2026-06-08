import { db } from '@/lib/db'
import { user, productRegistration, warrantyRecord, ownershipTransfer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [reg] = await db
    .select({
      id: productRegistration.id,
      userId: productRegistration.userId,
      modelId: productRegistration.modelId,
      modelName: productRegistration.modelName,
      installationDate: productRegistration.installationDate,
      installationAddressState: productRegistration.installationAddressState,
      installationAddressDetail: productRegistration.installationAddressDetail,
      contactPerson: productRegistration.contactPerson,
      phoneNumber: productRegistration.phoneNumber,
      purchaseDate: productRegistration.purchaseDate,
      dealerName: productRegistration.dealerName,
      serialNumber: productRegistration.serialNumber,
      serialNumberValid: productRegistration.serialNumberValid,
      warrantyCardUrl: productRegistration.warrantyCardUrl,
      serialNumberImageUrl: productRegistration.serialNumberImageUrl,
      status: productRegistration.status,
      submittedAt: productRegistration.submittedAt,
      userName: user.name,
      userEmail: user.email,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(productRegistration)
    .leftJoin(user, eq(productRegistration.userId, user.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(productRegistration.id, id))
    .limit(1)

  if (!reg) notFound()

  const transfers = await db
    .select()
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.registrationId, id))

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    REGISTERED_WITH_WARRANTY: { bg: '#e8f5e9', color: '#2e7d32', label: 'Registered — With Warranty' },
    REGISTERED_NO_WARRANTY:   { bg: '#fff8e1', color: '#f57f17', label: 'Registered — No Warranty' },
    PENDING:                  { bg: '#e3f2fd', color: '#1565c0', label: 'Pending' },
    RETURNED:                 { bg: '#fce4ec', color: '#c62828', label: 'Returned' },
  }
  const s = statusMap[reg.status] ?? { bg: 'var(--line-2)', color: 'var(--ink-3)', label: reg.status }

  const fields: [string, string | null | undefined][] = [
    ['Model', reg.modelName],
    ['Model ID', reg.modelId],
    ['Serial Number', reg.serialNumber],
    ['Serial Valid', reg.serialNumberValid == null ? 'Unknown' : reg.serialNumberValid ? 'Yes' : 'No'],
    ['Installation Date', reg.installationDate ? new Date(reg.installationDate).toLocaleDateString('en-AU') : '—'],
    ['Province / State', reg.installationAddressState],
    ['Address Detail', reg.installationAddressDetail],
    ['Contact Person', reg.contactPerson],
    ['Phone Number', reg.phoneNumber ?? '—'],
    ['Purchase Date', reg.purchaseDate ? new Date(reg.purchaseDate).toLocaleDateString('en-AU') : '—'],
    ['Dealer', reg.dealerName ?? '—'],
    ['Submitted', reg.submittedAt ? new Date(reg.submittedAt).toLocaleString('en-AU') : '—'],
    ['Warranty Expires', reg.warrantyExpiry ? new Date(reg.warrantyExpiry).toLocaleDateString('en-AU') : '—'],
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/registrations" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>← Registrations</Link>
        <span style={{ color: 'var(--line)', fontSize: 16 }}>/</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{reg.modelName}</h1>
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
          fontSize: 12, fontWeight: 600, background: s.bg, color: s.color,
        }}>
          {s.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Registration details */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '24px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>Registration Details</h2>
          <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 16 }}>
                <dt style={{ color: 'var(--ink-3)', fontWeight: 500, flexShrink: 0 }}>{label}</dt>
                <dd style={{ margin: 0, color: 'var(--ink-2)', textAlign: 'right', wordBreak: 'break-word' }}>{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* User + images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User card */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '20px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 12px' }}>Account</h2>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{reg.userName}</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-3)' }}>{reg.userEmail}</p>
            <Link href={`/admin/users/${reg.userId}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View user →
            </Link>
          </div>

          {/* Images */}
          {(reg.warrantyCardUrl || reg.serialNumberImageUrl) && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '20px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 14px' }}>Uploaded Images</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reg.warrantyCardUrl && (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 6px', fontWeight: 500 }}>Warranty Card</p>
                    <a href={reg.warrantyCardUrl} target="_blank" rel="noreferrer">
                      <img
                        src={reg.warrantyCardUrl}
                        alt="Warranty card"
                        style={{ width: '100%', borderRadius: 6, border: '1px solid var(--line)', objectFit: 'cover', maxHeight: 160 }}
                      />
                    </a>
                  </div>
                )}
                {reg.serialNumberImageUrl && (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 6px', fontWeight: 500 }}>Serial Number Image</p>
                    <a href={reg.serialNumberImageUrl} target="_blank" rel="noreferrer">
                      <img
                        src={reg.serialNumberImageUrl}
                        alt="Serial number"
                        style={{ width: '100%', borderRadius: 6, border: '1px solid var(--line)', objectFit: 'cover', maxHeight: 160 }}
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ownership transfers */}
      {transfers.length > 0 && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginTop: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Ownership Transfers ({transfers.length})</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
                {['Date', 'Previous Address', 'New Address', 'Previous Contact', 'New Contact'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '11px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-AU')}
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--ink-2)' }}>{t.previousAddressDetail ?? '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--ink-2)' }}>{t.newAddressDetail ?? '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--ink-2)' }}>{t.previousContactPerson ?? '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--ink-2)' }}>{t.newContactPerson ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
