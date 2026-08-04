import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notificationSetting } from '@/lib/db/schema'

/**
 * The automatic emails the site sends, in the order staff see them.
 *
 * `key` is stored; the labels are what the admin portal shows. Adding one here
 * plus a call to notificationConfig() is all a new notification needs.
 */
export const NOTIFICATIONS = [
  { key: 'welcome', label: '会員登録完了メール', description: '新規会員登録の直後に送信されます。' },
  { key: 'password_reset', label: 'パスワード再設定メール', description: 'パスワードをお忘れの場合の再設定リンク。' },
  { key: 'registration', label: '製品登録受付メール', description: '製品登録を受け付けたことをお知らせします。' },
  { key: 'warranty', label: '電子保証カード発行メール', description: '保証が発行されたときに送信されます。' },
  { key: 'contact_reply', label: 'お問い合わせ自動返信', description: 'お問い合わせいただいた方への受付確認。' },
  { key: 'contact_staff', label: 'お問い合わせ通知（担当部署）', description: '担当部署へのお問い合わせ内容の転送。' },
] as const

export type NotificationKey = (typeof NOTIFICATIONS)[number]['key']

export interface NotificationConfig {
  enabled: boolean
  cc: string[]
}

const parseCc = (value: string | null): string[] =>
  (value ?? '')
    .split(/[,;\s]+/)
    .map((a) => a.trim())
    .filter(Boolean)

/**
 * Defaults to enabled with no CC when nothing is stored, so a notification
 * added in code keeps working before an admin has ever opened the settings —
 * and a database hiccup never silently stops customer email.
 */
export async function notificationConfig(key: NotificationKey): Promise<NotificationConfig> {
  try {
    const [row] = await db
      .select()
      .from(notificationSetting)
      .where(eq(notificationSetting.key, key))
      .limit(1)
    if (!row) return { enabled: true, cc: [] }
    return { enabled: row.enabled, cc: parseCc(row.ccAddresses) }
  } catch (err) {
    console.error('[notifications] could not read settings, defaulting to enabled', err)
    return { enabled: true, cc: [] }
  }
}

export async function allNotificationConfigs(): Promise<Record<string, NotificationConfig>> {
  const rows = await db.select().from(notificationSetting)
  const stored = Object.fromEntries(
    rows.map((r) => [r.key, { enabled: r.enabled, cc: parseCc(r.ccAddresses) }])
  )
  return Object.fromEntries(
    NOTIFICATIONS.map((n) => [n.key, stored[n.key] ?? { enabled: true, cc: [] }])
  )
}
