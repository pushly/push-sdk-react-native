import type { NotificationAction } from '../notification-action';
import type { NotificationBadgeConfig } from '../notification-badge-config';

export type Notification = {
    id: string
    piid: string
    landingURL: string
    imageURL: string | null
    contentWebhookURL: string | null
    actions: NotificationAction[]
    badgeConfig: NotificationBadgeConfig | null
    title: string
    body: string | null
}
