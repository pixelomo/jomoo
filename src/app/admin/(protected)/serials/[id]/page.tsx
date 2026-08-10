import Link from 'next/link'
import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { getAdminSession, permissionsOf } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import {
  productRegistration,
  serialAuditLog,
  serialNumberEntry,
  user,
  warrantyRecord,
} from '@/lib/db/schema'
import { AUDIT_ACTION_META, type AuditAction } from '@/lib/serialStatus'
import SerialStatusBadge from '@/components/admin/SerialStatusBadge'
import SerialEditForm from '@/components/admin/SerialEditForm'

export const metadata = { title: 'Serial Number | JOMOO Admin' }

export default async function SerialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const permissions = permissionsOf(await getAdminSession())

  const [record] = await db
    .select({
      id: serialNumberEntry.id,
      serialNumber: serialNumberEntry.serialNumber,
      series: serialNumberEntry.series,
      modelName: serialNumberEntry.modelName,
      batch: serialNumberEntry.batch,
      status: serialNumberEntry.status,
      note: serialNumberEntry.note,
      registrationId: serialNumberEntry.registrationId,
      boundUserId: serialNumberEntry.boundUserId,
      boundAt: serialNumberEntry.boundAt,
      createdBy: serialNumberEntry.createdBy,
      createdAt: serialNumberEntry.createdAt,
      updatedAt: serialNumberEntry.updatedAt,
      userName: user.name,
      userEmail: user.email,
      registrationStatus: productRegistration.status,
      registrationModel: productRegistration.modelName,
      submittedAt: productRegistration.submittedAt,
      installationDate: productRegistration.installationDate,
      installationState: productRegistration.installationAddressState,
      dealerName: productRegistration.dealerName,
      warrantyExpiry: warrantyRecord.expiryDate,
    })
    .from(serialNumberEntry)
    .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
    .leftJoin(productRegistration, eq(serialNumberEntry.registrationId, productRegistration.id))
    .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
    .where(eq(serialNumberEntry.id, id))
    .limit(1)

  if (!record) notFound()

  const history = await db
    .select()
    .from(serialAuditLog)
    .where(eq(serialAuditLog.serialId, id))
    .orderBy(desc(serialAuditLog.createdAt))
    .limit(100)

  const date = (value: Date | string | null) =>
    value ? new Date(value).toLocaleDateString('en-AU') : '—'

  return (
    <div>
      <Link href="/admin/serials" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>
        ← Serial numbers
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0, fontFamily: 'monospace' }}>
          {record.serialNumber}
        </h1>
        <SerialStatusBadge status={record.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Usage details */}
          <section style={card}>
            <h2 style={cardTitle}>Usage details</h2>
            {record.boundUserId || record.registrationId ? (
              <dl style={dl}>
                <Row label="Registered by">
                  {record.boundUserId ? (
                    <Link href={`/admin/users/${record.boundUserId}`} style={linkStyle}>
                      {record.userName ?? record.userEmail ?? record.boundUserId}
                    </Link>
                  ) : (
                    '—'
                  )}
                </Row>
                <Row label="Email">{record.userEmail ?? '—'}</Row>
                <Row label="Registration">
                  {record.registrationId ? (
                    <Link href={`/admin/registrations/${record.registrationId}`} style={linkStyle}>
                      {record.registrationModel ?? record.registrationId}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>
                      No longer linked — the registration was removed
                    </span>
                  )}
                </Row>
                <Row label="Registration status">{record.registrationStatus ?? '—'}</Row>
                <Row label="Claimed on">{date(record.boundAt)}</Row>
                <Row label="Submitted">{date(record.submittedAt)}</Row>
                <Row label="Installed">{date(record.installationDate)}</Row>
                <Row label="Installed at">{record.installationState ?? '—'}</Row>
                <Row label="Dealer">{record.dealerName ?? '—'}</Row>
                <Row label="Warranty until">{date(record.warrantyExpiry)}</Row>
              </dl>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
                Nobody has registered this serial number yet.
              </p>
            )}
          </section>

          {/* Library record */}
          <section style={card}>
            <h2 style={cardTitle}>Library record</h2>
            <dl style={dl}>
              <Row label="Series">{record.series ?? '—'}</Row>
              <Row label="Model">{record.modelName ?? '—'}</Row>
              <Row label="Batch">{record.batch ?? '—'}</Row>
              <Row label="Note">{record.note ?? '—'}</Row>
              <Row label="Added by">{record.createdBy ?? '—'}</Row>
              <Row label="Added on">{date(record.createdAt)}</Row>
              <Row label="Last changed">{date(record.updatedAt)}</Row>
            </dl>
          </section>

          {/* Audit trail */}
          <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <h2 style={{ ...cardTitle, padding: '20px 22px 0', margin: 0 }}>History</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td style={{ padding: '20px 22px', color: 'var(--ink-3)' }}>
                      Nothing recorded for this serial number.
                    </td>
                  </tr>
                )}
                {history.map((entry) => {
                  const meta = AUDIT_ACTION_META[entry.action as AuditAction]
                  return (
                    <tr key={entry.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                      <td style={{ padding: '12px 22px', width: 150, color: 'var(--ink-3)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        {new Date(entry.createdAt).toLocaleString('en-AU', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '12px 0', width: 90, verticalAlign: 'top' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background: meta?.bg ?? 'var(--line-2)',
                            color: meta?.color ?? 'var(--ink-3)',
                          }}
                        >
                          {meta?.label ?? entry.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 22px 12px 12px', color: 'var(--ink-2)', lineHeight: 1.5, verticalAlign: 'top' }}>
                        {entry.details ?? '—'}
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                          by {entry.operator}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </div>

        <SerialEditForm
          id={record.id}
          serialNumber={record.serialNumber}
          initial={{
            series: record.series,
            modelName: record.modelName,
            batch: record.batch,
            status: record.status,
            note: record.note,
          }}
          permissions={permissions}
        />
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt style={{ fontSize: 12, color: 'var(--ink-3)', padding: '7px 0' }}>{label}</dt>
      <dd style={{ fontSize: 13, color: 'var(--ink-2)', padding: '7px 0', margin: 0, wordBreak: 'break-word' }}>
        {children}
      </dd>
    </>
  )
}

const card: React.CSSProperties = {
  background: 'var(--paper)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '20px 22px',
}

const cardTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  margin: '0 0 12px',
}

const dl: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(120px, 160px) 1fr',
  gap: '0 16px',
  margin: 0,
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent)',
  textDecoration: 'none',
  fontWeight: 500,
}
