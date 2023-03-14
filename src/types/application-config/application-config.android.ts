import type { ApplicationConfig as ApplicationConfigBase } from './index';
import type { AndroidNotificationChannel } from '../android-notification-channel';

export type ApplicationConfig = ApplicationConfigBase & {
    channels: AndroidNotificationChannel[]
}
