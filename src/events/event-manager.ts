import type { PushSdkReactBridge } from '../types/push-sdk-react-bridge';
import { EmitterSubscription, NativeEventEmitter } from 'react-native';

type EventHandler = (event: any) => void;

export enum BridgeEvent {
    DID_FINISH_LOADING = 'onPushSDKDidFinishLoading',
    DID_EXIT_WITH_STATUS = 'onPushSDKDidExitWithSubscriberStatus',
    DID_RECEIVE_PERMISSION_RESPONSE = 'onPushSDKDidReceivePermissionResponse',
    DID_RECEIVE_PERMISSION_RESPONSE_WITH_ERROR = 'onPushSDKDidReceivePermissionResponseWithError',
    DID_REGISTER_FOR_REMOVE_NOTIFICATIONS = 'onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken',
    DID_FAIL_TO_REGISTER = 'onPushSDKDidFailToRegisterForRemoteNotificationsWithError',
    DID_RECEIVE_REMOTE_NOTIFICATION = 'onPushSDKDidReceiveRemoteNotification',
    DID_RECEIVE_NOTIFICATION_DESTINATION = 'onPushSDKDidReceiveNotificationDestination',
}

const EVENTS: string[] = [
    BridgeEvent.DID_FINISH_LOADING,
    BridgeEvent.DID_EXIT_WITH_STATUS,
    BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE,
    BridgeEvent.DID_RECEIVE_PERMISSION_RESPONSE_WITH_ERROR,
    BridgeEvent.DID_REGISTER_FOR_REMOVE_NOTIFICATIONS,
    BridgeEvent.DID_FAIL_TO_REGISTER,
    BridgeEvent.DID_RECEIVE_REMOTE_NOTIFICATION,
    BridgeEvent.DID_RECEIVE_NOTIFICATION_DESTINATION,
];

export class EventManager {
    private emitter: NativeEventEmitter;
    private subscriptions: { [key: string]: EmitterSubscription } = {};

    private handlers: Map<String, EventHandler> = new Map();
    private mHandlers: Map<String, EventHandler[]> = new Map();

    constructor(
        private readonly bridge: PushSdkReactBridge,
    ) {
        this.emitter = new NativeEventEmitter(this.bridge);

        for (const event of EVENTS) {
            this.subscriptions[event] = this.getSubscription(event);
        }
    }

    removeAllEventHandlers() {
        this.handlers = new Map();
        this.mHandlers = new Map();
    }

    removeEventHandler(name: string) {
        this.handlers.delete(name);
        this.mHandlers.delete(name);
    }

    setEventHandler(name: string, handler: EventHandler) {
        this.handlers.set(name, handler);
        this.mHandlers.delete(name);
    }

    addEventHandler(name: string, handler: EventHandler) {
        const singular = this.handlers.get(name);
        const handlers = this.mHandlers.get(name) ?? [];

        if (singular && !handlers.length) {
            handlers.push(singular);
            this.handlers.delete(name);
        }

        handlers.push(handler);
        this.mHandlers.set(name, handlers);
    }

    getSubscription(name: string): EmitterSubscription {
        return this.emitter.addListener(name, payload => {
            if (this.handlers.has(name)) {
                const handler = this.handlers.get(name)!;
                handler(payload);
            } else if (this.mHandlers.has(name)) {
                const handlers = this.mHandlers.get(name)!;
                handlers.forEach(handler => {
                    handler(payload);
                });
            }
        });
    }
}
