import { Suspense } from 'react'
import Link from 'next/link'
import { desc, eq, sql } from 'drizzle-orm'
import { getAdminSession, permissionsOf } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { serialNumberEntry, user } from '@/lib/db/schema'
import { serialFilters } from '@/lib/serialLibrary'
import { SERIAL_STATUSES, SERIAL_STATUS_META } from '@/lib/serialStatus'
import AdminSearch from '@/components/admin/AdminSearch'
import DownloadButton from '@/components/admin/DownloadButton'
import SerialTable, { type SerialRow } from '@/components/admin/SerialTable'
import SerialAddButton from '@/components/admin/SerialAddButton'
import SerialImportButton from '@/components/admin/SerialImportButton'
import SerialTabs from '@/components/admin/SerialTabs'

export const metadata = { title: 'Serial Numbers | JOMOO Admin' }

const LIMIT = 25

export default async function SerialLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; batch?: string; page?: string }>
}) {
  const params = await searchParams
  const session = await getAdminSession()
  const permissions = permissionsOf(session)

  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.status) query.set('status', params.status)
  if (params.batch) query.set('batch', params.batch)
  const where = serialFilters(query)

  const [rows, [{ total }], counts] = await Promise.all([
    db
      .select({
        id: serialNumberEntry.id,
        serialNumber: serialNumberEntry.serialNumber,
        series: serialNumberEntry.series,
        modelName: serialNumberEntry.modelName,
        batch: serialNumberEntry.batch,
        status: serialNumberEntry.status,
        registrationId: serialNumberEntry.registrationId,
        boundAt: serialNumberEntry.boundAt,
        boundUserName: user.name,
        boundUserEmail: user.email,
        createdAt: serialNumberEntry.createdAt,
      })
      .from(serialNumberEntry)
      .leftJoin(user, eq(serialNumberEntry.boundUserId, user.id))
      .where(where)
      .orderBy(desc(serialNumberEntry.createdAt))
      .limit(LIMIT)
      .offset((page - 1) * LIMIT),
    db.select({ total: sql<number>`count(*)::int` }).from(serialNumberEntry).where(where),
    // One pass for every status count — the filter chips would otherwise cost
    // four more round trips to Railway on every page view.
    db
      .select({
        all: sql<number>`count(*)::int`,
        unused: sql<number>`count(*) filter (where ${serialNumberEntry.status} = 'UNUSED')::int`,
        bound: sql<number>`count(*) filter (where ${serialNumberEntry.status} = 'BOUND')::int`,
        revoked: sql<number>`count(*) filter (where ${serialNumberEntry.status} = 'REVOKED')::int`,
        abnormal: sql<number>`count(*) filter (where ${serialNumberEntry.status} = 'ABNORMAL')::int`,
      })
      .from(serialNumberEntry),
  ])

  const byStatus = counts[0] ?? { all: 0, unused: 0, bound: 0, revoked: 0, abnormal: 0 }
  const countFor: Record<string, number> = {
    UNUSED: byStatus.unused,
    BOUND: byStatus.bound,
    REVOKED: byStatus.revoked,
    ABNORMAL: byStatus.abnormal,
  }

  const tableRows: SerialRow[] = rows.map((r) => ({
    ...r,
    boundAt: r.boundAt ? r.boundAt.toISOString() : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }))

  const pageLink = (n: number) => {
    const next = new URLSearchParams(query)
    next.set('page', String(n))
    return `/admin/serials?${next}`
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          Serial Numbers
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SerialAddButton />
          <SerialImportButton />
          {permissions.export ? (
            <DownloadButton href={`/api/admin/export/serials?${query}`} label="Download CSV" />
          ) : (
            <span title="Your role cannot export data." style={disabledButton}>Download CSV</span>
          )}
        </div>
      </div>

      <SerialTabs />

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '16px 0' }}>
        <FilterChip
          href="/admin/serials"
          label="All"
          count={byStatus.all}
          active={!params.status}
        />
        {SERIAL_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/serials?status=${s}`}
            label={SERIAL_STATUS_META[s].label}
            title={SERIAL_STATUS_META[s].description}
            count={countFor[s]}
            active={params.status === s}
          />
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
          {total} shown
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
          <AdminSearch placeholder="Search by serial number, model, batch or note…" />
        </Suspense>
      </div>

      {byStatus.all === 0 && (
        <p
          style={{
            padding: '14px 16px',
            marginBottom: 16,
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--ink-2)',
            lineHeight: 1.6,
          }}
        >
          The library is empty, so registrations are still accepted on serial format alone.
          Import a batch — a CSV or a plain list of serial numbers — to start tracking real
          numbers.
        </p>
      )}

      <SerialTable rows={tableRows} permissions={permissions} />

      {total > LIMIT && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 }}>
          {page > 1 && <Link href={pageLink(page - 1)} style={pageButton}>← Prev</Link>}
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          {page * LIMIT < total && <Link href={pageLink(page + 1)} style={pageButton}>Next →</Link>}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  href,
  label,
  count,
  active,
  title,
}: {
  href: string
  label: string
  count: number
  active: boolean
  title?: string
}) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        padding: '7px 14px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--ink-3)',
        background: active ? 'var(--accent-soft, #eef4ff)' : 'transparent',
        border: active ? '1px solid #b3ceff' : '1px solid transparent',
        textDecoration: 'none',
      }}
    >
      {label}
      <span style={{ marginLeft: 6, opacity: 0.7 }}>{count}</span>
    </Link>
  )
}


const disabledButton: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 8,
  background: 'var(--line-2)',
  color: 'var(--ink-3)',
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  cursor: 'not-allowed',
}

const pageButton: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--ink-2)',
  textDecoration: 'none',
  background: 'var(--paper)',
}
