import { NOTIFICATIONS, allNotificationConfigs } from '@/lib/notifications'
import { allTemplates } from '@/lib/emailTemplates'
import NotificationSettingsForm from '@/components/admin/NotificationSettingsForm'

export const metadata = { title: 'Notifications | JOMOO Admin' }

export default async function NotificationsPage() {
  const [configs, templates] = await Promise.all([allNotificationConfigs(), allTemplates()])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>
        Automatic Emails
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 28px', maxWidth: 640 }}>
        Switch each automatic email on or off, and copy operational staff on any of them.
        Turning one off stops it being sent to customers. <strong>Edit template</strong> changes
        the wording customers actually read.
      </p>

      <NotificationSettingsForm
        notifications={NOTIFICATIONS.map((n) => ({
          ...n,
          enabled: configs[n.key].enabled,
          ccAddresses: configs[n.key].cc.join(', '),
        }))}
        templates={templates}
      />
    </div>
  )
}
