'use client'

/**
 * Plain anchor with a download hint — the endpoint sets the filename.
 *
 * A real navigation, not next/link: the href is a route handler that answers
 * with a file, and a client-side transition has nothing to render.
 *
 * `outline` is for a download that sits beside the page's primary action, so
 * the toolbar does not end up with two filled buttons competing.
 */
export default function DownloadButton({
  href,
  label,
  variant = 'solid',
}: {
  href: string
  label: string
  variant?: 'solid' | 'outline'
}) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 16px',
        borderRadius: 8,
        border: variant === 'outline' ? '1px solid var(--line)' : '0',
        background: variant === 'outline' ? 'var(--paper)' : 'var(--ink)',
        color: variant === 'outline' ? 'var(--ink-2)' : '#fff',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {label}
    </a>
  )
}
