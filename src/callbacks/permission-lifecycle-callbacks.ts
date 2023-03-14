import type { PermissionResponse } from '../enums/permission-response';

export type PermissionLifecycleCallbacks = {
    onPushSDKDidReceivePermissionResponse?(response: PermissionResponse): void
    onPushSDKDidReceivePermissionResponseWithError?(response: PermissionResponse, error: Error): void
    onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken?(token: string): void
    onPushSDKDidFailToRegisterForRemoteNotificationsWithError?(error: Error): void
}
