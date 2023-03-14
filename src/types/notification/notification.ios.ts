import type { Notification as NotificationBase } from './index';

export type Notification = NotificationBase & {
    titleLocKey: string | null
    titleLocArgs: string[] | null
    subtitle: string | null
    subtitleLocKey: string | null
    subtitleLocArgs: string[] | null
    locKey: string | null
    locArgs: string[] | null
    launchImage: string | null

    // aps keys
    category: string | null
    badge: number | null
    sound: string | null
    threadId: string | null
    contentAvailable: boolean
    mutableContent: boolean
    targetContentId: string | null
    interruptionLevel: string | null
    relevanceScore: number | null
    filterCriteria: string | null
}
