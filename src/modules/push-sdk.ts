import { NativeModules } from 'react-native';
import { RCT_BRIDGE_NAME } from '../constants';
import type { PushSdkReactBridge } from '../types/push-sdk-react-bridge';
import { Logger } from '../logger';
import { LogLevel } from '../enums/log-level';
import { BridgeEvent, EventManager } from '../events/event-manager';
import { permissionResponseFromRaw, subscriberStatusFromRaw } from '../helpers';
import { PushSDKEComm } from './push-sdk-ecomm';
import { PushSDKUserProfile } from './push-sdk-user-profile';
import type { PushSDKLifecycleCallbacks } from '../callbacks/push-sdk-lifecycle-callbacks';
import type { PermissionLifecycleCallbacks } from '../callbacks/permission-lifecycle-callbacks';
import type { NotificationLifecycleCallbacks } from '../callbacks/notification-lifecycle-callbacks';
import type { NotificationPermissionResponse } from '../types/notification-permission-response';
import type { ClientConfig } from '../types/client-config';
import { PushSDKException } from '../exceptions/push-sdk-exception';

export class PushSDK {
    static readonly UserProfile = PushSDKUserProfile;
    static readonly EComm = PushSDKEComm;

    private static readonly bridge: PushSdkReactBridge = NativeModules[RCT_BRIDGE_NAME];
    private static readonly eventManager = new EventManager(this.bridge);

    static setConfiguration(config: ClientConfig) {
        if (config.debug) {
            this.setLogLevel(LogLevel.VERBOSE);
        }

        this.bridge.setConfiguration(config.appKey);
    }

    static setLogLevel(level: LogLevel) {
        Logger.logLevel = level;
        this.bridge.setLogLevel(LogLevel[level]);
    }

    static async showNativeNotificationPermissionPrompt(
        skipConditionsEvaluation: boolean = false,
        skipFrequencyCapEvaluation: boolean = false,
    ): Promise<NotificationPermissionResponse> {
        const res = await this.bridge.showNativeNotificationPermissionPrompt(
            skipConditionsEvaluation,
            skipFrequencyCapEvaluation,
        );

        return {
            granted: res.granted,
            status: subscriberStatusFromRaw(res.status),
        };
    }

    static registerPushSDKLifecycleCallbacks(callbacks: PushSDKLifecycleCallbacks) {
        if (BridgeEvent.DID_FINISH_LOADING in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_FINISH_LOADING, (event) => {
                callbacks[BridgeEvent.DID_FINISH_LOADING]!(
                    event.configuration,
                    subscriberStatusFromRaw(event.subscriberStatus),
                );
            });
        }
        if (BridgeEvent.DID_EXIT_WITH_STATUS in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_EXIT_WITH_STATUS, (event) => {
                callbacks[BridgeEvent.DID_EXIT_WITH_STATUS]!(
                    subscriberStatusFromRaw(event.status),
                    event.deleted,
                );
            });
        }

        this.bridge.registerPushSDKLifecycleCallbacks();
    }

    static registerPermissionLifecycleCallbacks(callbacks: PermissionLifecycleCallbacks) {
        if (BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE, (event) => {
                callbacks[BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE]!(
                    permissionResponseFromRaw(event.response),
                );
            });
        }
        if (BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE_WITH_ERROR in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE_WITH_ERROR, (event) => {
                callbacks[BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE_WITH_ERROR]!(
                    permissionResponseFromRaw(event.response),
                    new PushSDKException(event.error),
                );
            });
        }
        if (BridgeEvent.DID_REGISTER_FOR_REMOVE_NOTIFICATIONS in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_REGISTER_FOR_REMOVE_NOTIFICATIONS, (event) => {
                callbacks[BridgeEvent.DID_REGISTER_FOR_REMOVE_NOTIFICATIONS]!(
                    event.token,
                );
            });
        }
        if (BridgeEvent.DID_FAIL_TO_REGISTER in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_FAIL_TO_REGISTER, (event) => {
                callbacks[BridgeEvent.DID_FAIL_TO_REGISTER]!(
                    new PushSDKException(event.error),
                );
            });
        }

        this.bridge.registerPermissionLifecycleCallbacks();
    }

    static registerNotificationLifecycleCallbacks(callbacks: NotificationLifecycleCallbacks) {
        if (BridgeEvent.DID_RECEIVE_REMOTE_NOTIFICATION in callbacks) {
            this.eventManager.setEventHandler(BridgeEvent.DID_RECEIVE_REMOTE_NOTIFICATION, (event) => {
                callbacks[BridgeEvent.DID_RECEIVE_REMOTE_NOTIFICATION]!(event.notification);
            });
        }

        const customDestinationHandlerProvided = callbacks[BridgeEvent.DID_RECEIVE_NOTIFICATION_DESTINATION] !== null;
        if (customDestinationHandlerProvided) {
            this.eventManager.setEventHandler(BridgeEvent.DID_RECEIVE_NOTIFICATION_DESTINATION, (event) => {
                Promise.resolve(callbacks[BridgeEvent.DID_RECEIVE_NOTIFICATION_DESTINATION]!(
                    event.destination,
                    event.interaction
                )).then(clientHandled => {
                    if (event.iid) {
                        this.bridge.completeNotificationDestinationInteraction(event.iid, clientHandled);
                    }
                }).catch(err => {
                    Logger.warn(err);
                    if (event.iid) {
                        this.bridge.completeNotificationDestinationInteraction(event.iid, true);
                    }
                });
            });
        }

        this.bridge.registerNotificationLifecycleCallbacks(customDestinationHandlerProvided);
    }
}
