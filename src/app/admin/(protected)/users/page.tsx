import { db } from '@/lib/db'
import { user, productRegistration, dealerBranch } from '@/lib/db/schema'
import { eq, desc, sql, ilike, or, and, isNull, asc, type SQL } from 'drizzle-orm'
import Link from 'next/link'
import DownloadButton from '@/components/admin/DownloadButton'
import { Suspense } from 'react'
import AdminSearch from '@/components/admin/AdminSearch'
import AdminFilter from '@/components/admin/AdminFilter'
import MemberTypeBadge from '@/components/admin/MemberTypeBadge'

const TYPE_OPTIONS = [
  { value: 'corporate', label: '法人 · Dealer' },
  { value: 'individual', label: '個人 · Customer' },
  // Accounts that predate member_type. Worth being able to see on purpose:
  // they are the ones a backfill has not reached.
  { value: 'unset', label: 'Unset' },
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string; branch?: string }>
}) {
  const { q = '', page: pageStr = '1', type = '', branch = '' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 20
  const offset = (page - 1) * limit

  // Built as a list so the count query filters on exactly what the table shows
  // — counting a different set is what made the page numbers wrong before.
  const conditions: SQL[] = []
  if (q.trim()) {
    conditions.push(or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`))!)
  }
  if (type === 'unset') conditions.push(isNull(user.memberType))
  else if (type) conditions.push(eq(user.memberType, type))
  if (branch) conditions.push(eq(user.branchId, branch))

  const where = conditions.length ? and(...conditions) : undefined

  const branches = await db
    .select({ id: dealerBranch.id, name: dealerBranch.name, city: dealerBranch.city })
    .from(dealerBranch)
    .orderBy(asc(dealerBranch.name))

  const [users, [{ total }]] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        memberType: user.memberType,
        branchName: dealerBranch.name,
        createdAt: user.createdAt,
        regCount: sql<number>`count(${productRegistration.id})::int`,
      })
      .from(user)
      .leftJoin(productRegistration, eq(productRegistration.userId, user.id))
      .leftJoin(dealerBranch, eq(dealerBranch.id, user.branchId))
      .where(where)
      .groupBy(user.id, dealerBranch.name)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: sql<number>`count(*)::int` }).from(user).where(where),
  ])

  // Carried through paging so page 2 keeps the filters page 1 was showing.
  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  if (type) qs.set('type', type)
  if (branch) qs.set('branch', branch)
  const suffix = qs.toString() ? `&${qs}` : ''

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Users</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{total} total</span>
          <DownloadButton href="/api/admin/export/users" label="Download CSV" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 200 }}>
          <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
            <AdminSearch placeholder="Search by name or email…" />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <AdminFilter param="type" label="Type" options={TYPE_OPTIONS} allLabel="All types" />
        </Suspense>
        <Suspense fallback={null}>
          <AdminFilter
            param="branch"
            label="Dealer"
            allLabel="All dealers"
            options={branches.map((b) => ({
              value: b.id,
              label: b.city ? `${b.name}（${b.city}）` : b.name,
            }))}
          />
        </Suspense>
      </div>

      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflowX: 'auto',
        marginTop: 16,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Name', 'Email', 'Type', 'Dealer', 'Joined', 'Registrations', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No users found</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><MemberTypeBadge type={u.memberType} /></td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{u.branchName ?? '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-AU')}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{u.regCount}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Link
                    href={`/admin/users/${u.id}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                    }}
                  >
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
              <Link href={`/admin/users?page=${page - 1}${suffix}`} style={pageBtnStyle}>← Prev</Link>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            {page * limit < total && (
              <Link href={`/admin/users?page=${page + 1}${suffix}`} style={pageBtnStyle}>Next →</Link>
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
