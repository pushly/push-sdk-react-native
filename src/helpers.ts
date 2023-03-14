import { SubscriberStatus } from './enums/subscriber-status';
import { PermissionResponse } from './enums/permission-response';

export const subscriberStatusFromRaw = (raw: number | string): SubscriberStatus => {
    const status = typeof raw === 'string' ? raw.toUpperCase() : raw;
    switch (status) {
        case SubscriberStatus.SUBSCRIBED:
        case 'SUBSCRIBED':
            return SubscriberStatus.SUBSCRIBED;

        case SubscriberStatus.DISMISSED:
        case 'DISMISSED':
            return SubscriberStatus.DISMISSED;

        case SubscriberStatus.DENIED:
        case 'DENIED':
            return SubscriberStatus.DENIED;

        case SubscriberStatus.NOT_DETERMINED:
        case 'NOT_DETERMINED':
        default:
            return SubscriberStatus.NOT_DETERMINED;
    }
};

export const permissionResponseFromRaw = (raw: number | string): PermissionResponse => {
    const res = typeof raw === 'string' ? raw.toUpperCase() : raw;
    switch (res) {
        case PermissionResponse.GRANTED:
        case 'GRANTED':
            return PermissionResponse.GRANTED;

        case PermissionResponse.DISMISSED:
        case 'DISMISSED':
            return PermissionResponse.DISMISSED;

        case PermissionResponse.DENIED:
        case 'DENIED':
        default:
            return PermissionResponse.DENIED;
    }
};
