import type { Notification } from '../types/notification';
import type { NotificationInteraction } from '../types/notification-interaction';

export type NotificationLifecycleCallbacks = {
    onPushSDKDidReceiveRemoteNotification?(notification: Notification): void

    /**
     * FALSE:   the event was not handled and is available for processing
     * TRUE:    the client handled the event and it should not be processed
     */
    onPushSDKDidReceiveNotificationDestination?(destination: string, interaction: NotificationInteraction): boolean
}
