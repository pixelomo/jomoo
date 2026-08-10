/**
 * The four states a serial number can be in.
 *
 * Kept apart from serialLibrary.ts because that module is `server-only` — the
 * batch-action toolbar and the edit form are client components and need these
 * labels too.
 */

export const SERIAL_STATUSES = ['UNUSED', 'BOUND', 'REVOKED', 'ABNORMAL'] as const
export type SerialStatus = (typeof SERIAL_STATUSES)[number]

export const SERIAL_STATUS_META: Record<
  SerialStatus,
  { label: string; description: string; bg: string; color: string }
> = {
  UNUSED: {
    label: 'Unused',
    description: 'Issued by the factory, not yet registered by anyone.',
    bg: '#e3f2fd',
    color: '#1565c0',
  },
  BOUND: {
    label: 'Bound',
    description: 'Registered to a member — see the usage details for who.',
    bg: '#e8f5e9',
    color: '#2e7d32',
  },
  REVOKED: {
    label: 'Revoked',
    description: 'Withdrawn: scrapped, recalled, or issued in error.',
    bg: '#fce4ec',
    color: '#c62828',
  },
  ABNORMAL: {
    label: 'Abnormal',
    description: 'Flagged for investigation — duplicate, suspected forgery, or a bad batch.',
    bg: '#fff8e1',
    color: '#f57f17',
  },
}

export function isSerialStatus(value: unknown): value is SerialStatus {
  return typeof value === 'string' && (SERIAL_STATUSES as readonly string[]).includes(value)
}

export const AUDIT_ACTIONS = [
  'IMPORT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'BIND',
  'UNBIND',
  'EXPORT',
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_ACTION_META: Record<AuditAction, { label: string; bg: string; color: string }> = {
  IMPORT: { label: 'Import', bg: '#ede7f6', color: '#5e35b1' },
  CREATE: { label: 'Create', bg: '#e3f2fd', color: '#1565c0' },
  UPDATE: { label: 'Update', bg: '#fff8e1', color: '#f57f17' },
  DELETE: { label: 'Delete', bg: '#fce4ec', color: '#c62828' },
  BIND: { label: 'Bind', bg: '#e8f5e9', color: '#2e7d32' },
  UNBIND: { label: 'Unbind', bg: '#eceff1', color: '#546e7a' },
  EXPORT: { label: 'Export', bg: '#e0f7fa', color: '#00838f' },
}
