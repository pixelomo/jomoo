'use client'

import Link from 'next/link'
import {
  CONTACT_CATEGORIES,
  CONTACT_DEPARTMENTS,
  departmentEmail,
  type ContactCategory,
} from '@/types/contact'

/**
 * Pills for narrowing the enquiry list, grouped the way the mail is routed.
 *
 * Only shown to accounts that are not already pinned to one department — for
 * those, the list is the filter, and offering a control that could only ever
 * narrow it further would suggest there was more behind it.
 *
 * Links rather than a select so a filtered view can be bookmarked and sent to
 * whoever has to answer it.
 */
export default function EnquiryCategoryFilter({ selected }: { selected?: ContactCategory }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Pills>
        <Pill href="/admin/enquiries" active={!selected}>All enquiries</Pill>
      </Pills>

      {CONTACT_DEPARTMENTS.map(dept => (
        <div key={dept.id} style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 170 }}>
            {dept.labelEn}
            <span style={{ opacity: 0.7 }}> · {departmentEmail(dept.id)}</span>
          </span>
          <Pills>
            {CONTACT_CATEGORIES.filter(c => c.department === dept.id).map(c => (
              <Pill key={c.id} href={`/admin/enquiries?category=${c.id}`} active={selected === c.id}>
                {c.label}
              </Pill>
            ))}
          </Pills>
        </div>
      ))}
    </div>
  )
}

function Pills({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '5px 11px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        textDecoration: 'none',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
        background: active ? 'var(--accent)' : 'var(--paper)',
        color: active ? '#fff' : 'var(--ink-2)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
  )
}
