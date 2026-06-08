import { db } from '@/lib/db'
import { user, productRegistration } from '@/lib/db/schema'
import { eq, desc, sql, ilike, or } from 'drizzle-orm'
import Link from 'next/link'
import { Suspense } from 'react'
import AdminSearch from '@/components/admin/AdminSearch'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 20
  const offset = (page - 1) * limit

  const baseSelect = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    regCount: sql<number>`count(${productRegistration.id})::int`,
  }

  const query = db
    .select(baseSelect)
    .from(user)
    .leftJoin(productRegistration, eq(productRegistration.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset)

  const users = q.trim()
    ? await query.where(or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`)))
    : await query

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(user)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Users</h1>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{total} total</span>
      </div>

      <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
        <AdminSearch placeholder="Search by name or email…" />
      </Suspense>

      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Name', 'Email', 'Joined', 'Registrations', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>No users found</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{u.email}</td>
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
              <Link href={`/admin/users?page=${page - 1}${q ? `&q=${q}` : ''}`} style={pageBtnStyle}>← Prev</Link>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            {page * limit < total && (
              <Link href={`/admin/users?page=${page + 1}${q ? `&q=${q}` : ''}`} style={pageBtnStyle}>Next →</Link>
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
