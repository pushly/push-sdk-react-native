import type { Notification } from './notification';
import type { NotificationAction } from './notification-action';

export type NotificationInteraction = {
    type: string
    actionIdentifier: string
    notification: Notification
    action: NotificationAction | null
}
