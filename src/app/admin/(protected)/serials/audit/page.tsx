import { Suspense } from 'react'
import Link from 'next/link'
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'
import { getAdminSession, permissionsOf } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialAuditLog } from '@/lib/db/schema'
import { AUDIT_ACTIONS, AUDIT_ACTION_META, type AuditAction } from '@/lib/serialStatus'
import AdminSearch from '@/components/admin/AdminSearch'
import DownloadButton from '@/components/admin/DownloadButton'
import SerialTabs from '@/components/admin/SerialTabs'

export const metadata = { title: 'Serial Audit Log | JOMOO Admin' }

const LIMIT = 50

/**
 * Who did what to the serial library.
 *
 * Read-only on purpose — there is no edit or delete here, because a log staff
 * can tidy up is not evidence of anything.
 */
export default async function SerialAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; operator?: string; page?: string }>
}) {
  const { q = '', action, operator, page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const permissions = permissionsOf(await getAdminSession())

  const clauses: SQL[] = []
  if (action && (AUDIT_ACTIONS as readonly string[]).includes(action)) {
    clauses.push(eq(serialAuditLog.action, action))
  }
  if (operator) clauses.push(eq(serialAuditLog.operator, operator))
  if (q.trim()) {
    const clause = or(
      ilike(serialAuditLog.serialNumber, `%${q.trim().toUpperCase()}%`),
      ilike(serialAuditLog.details, `%${q.trim()}%`),
      ilike(serialAuditLog.operator, `%${q.trim()}%`)
    )
    if (clause) clauses.push(clause)
  }
  const where = clauses.length ? and(...clauses) : undefined

  const [entries, [{ total }], operators] = await Promise.all([
    db
      .select()
      .from(serialAuditLog)
      .where(where)
      .orderBy(desc(serialAuditLog.createdAt))
      .limit(LIMIT)
      .offset((page - 1) * LIMIT),
    db.select({ total: sql<number>`count(*)::int` }).from(serialAuditLog).where(where),
    db
      .selectDistinct({ operator: serialAuditLog.operator })
      .from(serialAuditLog)
      .orderBy(serialAuditLog.operator)
      .limit(50),
  ])

  const link = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    const merged = { q, action, operator, ...patch }
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value)
    return `/admin/serials/audit${next.toString() ? `?${next}` : ''}`
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          Audit Log
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{total} entries</span>
          {permissions.export && (
            <DownloadButton href="/api/admin/export/serial-audit" label="Download CSV" />
          )}
        </div>
      </div>

      <SerialTabs />

      {/* Action filter */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '16px 0 12px' }}>
        <Chip href={link({ action: undefined, page: undefined })} label="All" active={!action} />
        {AUDIT_ACTIONS.map((a) => (
          <Chip
            key={a}
            href={link({ action: a, page: undefined })}
            label={AUDIT_ACTION_META[a].label}
            active={action === a}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
            <AdminSearch placeholder="Search by serial number, operator or description…" />
          </Suspense>
        </div>
        {operators.length > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Operator:</span>
            <Chip href={link({ operator: undefined, page: undefined })} label="Anyone" active={!operator} />
            {operators.map(({ operator: name }) => (
              <Chip
                key={name}
                href={link({ operator: name, page: undefined })}
                label={name}
                active={operator === name}
              />
            ))}
          </div>
        )}
      </div>

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
              {['When', 'Action', 'Operator', 'Serial Number', 'Details'].map((h) => (
                <th key={h} style={headCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  Nothing logged yet
                </td>
              </tr>
            )}
            {entries.map((e) => {
              const meta = AUDIT_ACTION_META[e.action as AuditAction]
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                  <td style={{ ...cell, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                    {new Date(e.createdAt).toLocaleString('en-AU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={cell}>
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
                      {meta?.label ?? e.action}
                    </span>
                  </td>
                  <td style={{ ...cell, color: 'var(--ink-2)', fontWeight: 500 }}>{e.operator}</td>
                  <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12, color: 'var(--ink-3)' }}>
                    {e.serialId && e.serialNumber ? (
                      <Link
                        href={`/admin/serials/${e.serialId}`}
                        style={{ color: 'var(--accent)', textDecoration: 'none' }}
                      >
                        {e.serialNumber}
                      </Link>
                    ) : (
                      e.serialNumber ?? '—'
                    )}
                  </td>
                  <td style={{ ...cell, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    {e.details ?? '—'}
                    {e.batchId && (
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                        batch {e.batchId.slice(0, 8)}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {total > LIMIT && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 }}>
          {page > 1 && <Link href={link({ page: String(page - 1) })} style={pageButton}>← Prev</Link>}
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          {page * LIMIT < total && (
            <Link href={link({ page: String(page + 1) })} style={pageButton}>Next →</Link>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: '5px 12px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--ink-3)',
        background: active ? 'var(--accent-soft, #eef4ff)' : 'transparent',
        border: active ? '1px solid #b3ceff' : '1px solid var(--line)',
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
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
