import type { NotificationAction } from './notification-action';

export type iOSNotificationCategory = {
    id: number
    identifier: string
    actions: NotificationAction[]
}
