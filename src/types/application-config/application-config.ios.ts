import type { ApplicationConfig as ApplicationConfigBase } from './index';
import type { iOSNotificationCategory } from '../ios-notification-category';

export type ApplicationConfig = ApplicationConfigBase & {
    categories: iOSNotificationCategory[]
    authorizationOptions: number
}
