import { SERIAL_STATUS_META, isSerialStatus } from '@/lib/serialStatus'

export default function SerialStatusBadge({ status }: { status: string }) {
  const meta = isSerialStatus(status)
    ? SERIAL_STATUS_META[status]
    : { label: status, bg: 'var(--line-2)', color: 'var(--ink-3)', description: '' }

  return (
    <span
      title={meta.description}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: meta.bg,
        color: meta.color,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  )
}
