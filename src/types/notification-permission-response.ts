import type { SubscriberStatus } from '../enums/subscriber-status';

export type NotificationPermissionResponse = {
    granted: boolean
    status: SubscriberStatus
}
