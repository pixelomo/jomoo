import Link from 'next/link'
import { desc, eq, isNotNull, sql } from 'drizzle-orm'
import { getAdminSession, permissionsOf } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import {
  productRegistration,
  serialNumberEntry,
  user,
  warrantyRecord,
} from '@/lib/db/schema'
import DownloadButton from '@/components/admin/DownloadButton'
import SerialTabs from '@/components/admin/SerialTabs'
import SerialStatusBadge from '@/components/admin/SerialStatusBadge'

export const metadata = { title: 'Serial Usage | JOMOO Admin' }

const LIMIT = 25

/**
 * Every serial that has actually been used, and what happened to it.
 *
 * The library page answers "what do we have"; this one answers "who has it" —
 * the question the warranty desk is on the phone about.
 */
export default async function SerialUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const permissions = permissionsOf(await getAdminSession())

  const where = isNotNull(serialNumberEntry.boundAt)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: serialNumberEntry.id,
        serialNumber: serialNumberEntry.serialNumber,
        modelName: serialNumberEntry.modelName,
        status: serialNumberEntry.status,
        boundAt: serialNumberEntry.boundAt,
        registrationId: serialNumberEntry.registrationId,
        userId: serialNumberEntry.boundUserId,
        userName: user.name,
        userEmail: user.email,
        registrationStatus: productRegistration.status,
        installationDate: productRegistration.installationDate,
        warrantyExpiry: warrantyRecord.expiryDate,
      })
      .from(serialNumberEntry)
      .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
      .leftJoin(productRegistration, eq(serialNumberEntry.registrationId, productRegistration.id))
      .leftJoin(warrantyRecord, eq(warrantyRecord.registrationId, productRegistration.id))
      .where(where)
      .orderBy(desc(serialNumberEntry.boundAt))
      .limit(LIMIT)
      .offset((page - 1) * LIMIT),
    db.select({ total: sql<number>`count(*)::int` }).from(serialNumberEntry).where(where),
  ])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          Serial Usage Details
        </h1>
        {permissions.export && (
          <DownloadButton href="/api/admin/export/serials?status=BOUND" label="Download CSV" />
        )}
      </div>

      <SerialTabs />

      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '16px 0', maxWidth: 640, lineHeight: 1.6 }}>
        {total} serial{total === 1 ? '' : 's'} {total === 1 ? 'has' : 'have'} been claimed by a
        product registration. A row still listed here with a status other than Bound was released
        by hand — the audit log says by whom.
      </p>

      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Serial Number', 'Model', 'Member', 'Registered', 'Installed', 'Warranty until', 'Status', ''].map((h) => (
                <th key={h} style={headCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No serial number has been registered yet
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12 }}>{r.serialNumber}</td>
                <td style={{ ...cell, color: 'var(--ink-2)' }}>{r.modelName ?? '—'}</td>
                <td style={cell}>
                  {r.userId ? (
                    <Link href={`/admin/users/${r.userId}`} style={{ textDecoration: 'none' }}>
                      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.userName ?? '—'}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>
                        {r.userEmail}
                      </span>
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>—</span>
                  )}
                </td>
                <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.boundAt ? new Date(r.boundAt).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.installationDate ? new Date(r.installationDate).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {r.warrantyExpiry ? new Date(r.warrantyExpiry).toLocaleDateString('en-AU') : '—'}
                </td>
                <td style={cell}><SerialStatusBadge status={r.status} /></td>
                <td style={cell}>
                  <Link
                    href={`/admin/serials/${r.id}`}
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > LIMIT && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 }}>
          {page > 1 && (
            <Link href={`/admin/serials/usage?page=${page - 1}`} style={pageButton}>← Prev</Link>
          )}
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          {page * LIMIT < total && (
            <Link href={`/admin/serials/usage?page=${page + 1}`} style={pageButton}>Next →</Link>
          )}
        </div>
      )}
    </div>
  )
}

const headCell: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--ink-3)',
  fontSize: 12,
}

const cell: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'top' }

const pageButton: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--ink-2)',
  textDecoration: 'none',
  background: 'var(--paper)',
}
