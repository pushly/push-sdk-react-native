import type { Notification as NotificationBase } from './index';

export type Notification = NotificationBase & {
    iconURL: string | null

    // fcm keys
    ttl: number
    priority: number
    collapseKey: number
    channelId: string
    groupId: string
    isSilent: boolean
}
