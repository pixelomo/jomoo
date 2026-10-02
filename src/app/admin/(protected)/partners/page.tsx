import { Suspense } from 'react'
import { getAdminSession, permissionsOf } from '@/lib/admin-auth'
import { listPartners } from '@/lib/partners'
import AdminSearch from '@/components/admin/AdminSearch'
import AdminFilter from '@/components/admin/AdminFilter'
import PartnerTable from '@/components/admin/PartnerTable'

const STATUS_OPTIONS = [
  { value: 'pending', label: '審査中 · Pending' },
  { value: 'approved', label: '承認済み · Approved' },
  { value: 'rejected', label: '否認 · Rejected' },
]

/**
 * パートナー applications. A partner signs up with the 法人 company form, but
 * nothing a dealer can do — the branch, its customers' registrations and
 * serials — opens until it is approved here.
 */
export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = '', status = '' } = await searchParams
  const session = await getAdminSession()
  const permissions = permissionsOf(session)

  const [partners, pending] = await Promise.all([
    listPartners({ q, status }),
    listPartners({ status: 'pending' }),
  ])

  const exportQuery = new URLSearchParams()
  if (q) exportQuery.set('q', q)
  if (status) exportQuery.set('status', status)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Partners</h1>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          {partners.length} shown · {pending.length} awaiting review
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 200 }}>
          <Suspense fallback={<div style={{ height: 38, background: 'var(--line-2)', borderRadius: 7 }} />}>
            <AdminSearch placeholder="Search company, contact, email, phone or address…" />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <AdminFilter param="status" label="Status" options={STATUS_OPTIONS} allLabel="All statuses" />
        </Suspense>
      </div>

      <PartnerTable
        partners={partners.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          partnerReviewedAt: p.partnerReviewedAt?.toISOString() ?? null,
        }))}
        exportQuery={exportQuery.toString()}
        canExport={permissions.export}
        filtered={Boolean(q || status)}
      />
    </div>
  )
}
