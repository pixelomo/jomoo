import { db } from '@/lib/db'
import { dealerBranch, productRegistration, user } from '@/lib/db/schema'
import { asc, ilike, sql } from 'drizzle-orm'
import Link from 'next/link'
import { Suspense } from 'react'
import AdminSearch from '@/components/admin/AdminSearch'

/**
 * The dealers, and how much sits behind each one.
 *
 * There is no dealer list to import — every row here arrived as a 法人 sign-up,
 * which is also what puts the branch in the select customers pick from when
 * they register a product. So an empty table is not a fault: it means no dealer
 * has signed up yet.
 */
export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  // Two scalar sub-selects rather than two joins: joining accounts and
  // registrations in one query multiplies the rows against each other, and the
  // counts come out as the product of the two.
  const accountCount = sql<number>`(
    select count(*)::int from ${user} where ${user.branchId} = ${dealerBranch.id}
  )`
  const registrationCount = sql<number>`(
    select count(*)::int from ${productRegistration}
    where ${productRegistration.branchId} = ${dealerBranch.id}
  )`
  const customerCount = sql<number>`(
    select count(distinct ${productRegistration.userId})::int from ${productRegistration}
    where ${productRegistration.branchId} = ${dealerBranch.id}
  )`

  const query = db
    .select({
      id: dealerBranch.id,
      name: dealerBranch.name,
      prefecture: dealerBranch.prefecture,
      city: dealerBranch.city,
      postalCode: dealerBranch.postalCode,
      createdAt: dealerBranch.createdAt,
      accounts: accountCount,
      registrations: registrationCount,
      customers: customerCount,
    })
    .from(dealerBranch)
    .orderBy(asc(dealerBranch.name))

  const dealers = q.trim() ? await query.where(ilike(dealerBranch.name, `%${q}%`)) : await query

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Dealers</h1>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{dealers.length} branches</span>
      </div>

      <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
        <AdminSearch placeholder="Search by dealer name…" />
      </Suspense>

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
              {['Dealer', 'Location', 'Accounts', 'Customers', 'Registrations', 'Added', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  {q ? 'No dealers match that name' : 'No dealers yet — a branch is added when a 法人 member signs up.'}
                </td>
              </tr>
            )}
            {dealers.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>{d.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>
                  {[d.prefecture, d.city].filter(Boolean).join(' ') || '—'}
                  {d.postalCode && (
                    <span style={{ color: 'var(--ink-3)', fontSize: 12 }}> 〒{d.postalCode}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{d.accounts}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{d.customers}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{d.registrations}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {new Date(d.createdAt).toLocaleDateString('en-AU')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link
                    href={`/admin/dealers/${d.id}`}
                    style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}
                  >
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
