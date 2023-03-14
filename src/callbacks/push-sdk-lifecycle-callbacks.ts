import type { ApplicationConfig } from '../types/application-config';
import type { SubscriberStatus } from '../enums/subscriber-status';

export type PushSDKLifecycleCallbacks = {
    onPushSDKDidFinishLoading?(configuration: ApplicationConfig, subscriberStatus: SubscriberStatus): void
    onPushSDKDidExitWithSubscriberStatus?(status: SubscriberStatus, deleted: boolean): void
}
