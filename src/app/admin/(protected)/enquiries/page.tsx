import { desc, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactSubmission } from '@/lib/db/schema'
import { getAdminSession, visibleContactCategories } from '@/lib/admin-auth'
import {
  CONTACT_CATEGORIES,
  categoryLabel,
  departmentEmail,
  departmentLabel,
  type ContactCategory,
} from '@/types/contact'
import DownloadButton from '@/components/admin/DownloadButton'
import EnquiryCategoryFilter from '@/components/admin/EnquiryCategoryFilter'

export const metadata = { title: 'Enquiries | JOMOO Admin' }

/**
 * The contact form's post, narrowed to the desk that has to answer it.
 *
 * An admin account pinned to a department (see lib/admin-auth.ts) reads only
 * the categories routed to that inbox — the after-sales desk opens this page
 * and finds support and fault reports, not recruitment applications. Accounts
 * with no department read everything and get a filter instead.
 */
export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const session = await getAdminSession()
  const allowed = visibleContactCategories(session)

  // The chosen filter is intersected with what the account may see, so a
  // hand-typed ?category= cannot reach another department's enquiries.
  const picked = CONTACT_CATEGORIES.find(c => c.id === category)?.id
  const selected = picked && (!allowed || allowed.includes(picked)) ? picked : undefined

  const categories: ContactCategory[] | null = selected
    ? [selected]
    : allowed

  const query = db
    .select()
    .from(contactSubmission)
    .orderBy(desc(contactSubmission.submittedAt))
    .limit(200)

  const rows = categories
    ? await query.where(inArray(contactSubmission.category, categories))
    : await query

  const scopeAddress = session?.department ? departmentEmail(session.department) : null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          Contact Enquiries
        </h1>
        <DownloadButton href="/api/admin/export/contact" label="Download CSV" />
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px' }}>
        {session?.department ? (
          <>
            {departmentLabel(session.department)} — enquiries sent to{' '}
            <strong style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{scopeAddress}</strong>
          </>
        ) : (
          'Every enquiry, across all departments.'
        )}
      </p>

      {/* Someone who sees everything needs a way to pick a desk; someone pinned
          to one desk already has the only view they are allowed. */}
      {!session?.department && <EnquiryCategoryFilter selected={selected} />}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, overflowX: 'auto', marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
              {['Received', 'Category', 'Name', 'Email', 'Message', 'Sent'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  No enquiries yet
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {new Date(r.submittedAt).toLocaleString('ja-JP')}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>
                  {categoryLabel(r.category as ContactCategory)}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink)' }}>
                  {r.lastName} {r.firstName}
                  {r.companyName && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.companyName}</div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{r.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)', maxWidth: 380 }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.message}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: r.delivered ? '#e8f5e9' : '#fce4ec',
                    color: r.delivered ? '#2e7d32' : '#c62828',
                  }}>
                    {r.delivered ? 'Sent' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
