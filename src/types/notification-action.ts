import type { NotificationActionVariation } from './notification-action-variation';

export type NotificationAction = {
    action: number
    ordinal: number
    title: string
    type: string
    landingURL: string | null
    variations: { [code: string]: NotificationActionVariation }[] | null
}
