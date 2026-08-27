/** 法人 or 個人 at a glance. Null on accounts created before the two were told
 *  apart — shown as a dash rather than guessed at from a 会社名. */
export default function MemberTypeBadge({ type }: { type: string | null }) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  }

  if (type === 'corporate') {
    return <span style={{ ...style, color: '#1d4ed8', background: '#eff6ff' }}>法人</span>
  }
  if (type === 'individual') {
    return <span style={{ ...style, color: '#3f6212', background: '#f7fee7' }}>個人</span>
  }
  return <span style={{ ...style, color: 'var(--ink-3)', background: 'var(--line-2)' }}>—</span>
}
