import { NativeModules } from 'react-native';
import type { PushSdkReactBridge } from '../types/push-sdk-react-bridge';
import type {
    UserProfileKVMapType,
    UserProfileValueType,
    UserProfileMap,
} from '../types/push-sdk-react-bridge';
import type { SubscriberStatus } from '../enums/subscriber-status';
import { subscriberStatusFromRaw } from '../helpers';
import { Logger } from '../logger';
import { RCT_BRIDGE_NAME } from '../constants';

const ReactBridge: PushSdkReactBridge = NativeModules[RCT_BRIDGE_NAME];

export class PushSDKUserProfile {
    private static readonly bridge: PushSdkReactBridge = NativeModules[RCT_BRIDGE_NAME];

    static async getProperties(): Promise<UserProfileMap> {
        const map = await ReactBridge.getUserProfileMap();
        return {
            ...map,
            subscriberStatus: subscriberStatusFromRaw(map.subscriberStatus),
        };
    }

    static async getAnonymousId(): Promise<string> {
        return ReactBridge.getAnonymousId();
    }

    static async getExternalId(): Promise<string | null> {
        return ReactBridge.getExternalId();
    }

    static setExternalId(id: string): void {
        return ReactBridge.setExternalId(id);
    }

    static async getIsSubscribed(): Promise<boolean> {
        return ReactBridge.getIsSubscribed();
    }

    static async getSubscriberStatus(): Promise<SubscriberStatus> {
        return subscriberStatusFromRaw(await ReactBridge.getSubscriberStatus());
    }

    static async getToken(): Promise<string | null> {
        return ReactBridge.getToken();
    }

    static async getIsEligibleToPrompt(): Promise<boolean> {
        return ReactBridge.getIsEligibleToPrompt();
    }

    static async getIsDeleted(): Promise<boolean> {
        return ReactBridge.getIsUserDeleted();
    }

    static async requestUserDeletion(): Promise<void> {
        return this.bridge.requestUserDeletion();
    }

    static async set(
        dataOrKey: UserProfileKVMapType | string,
        keyValue?: UserProfileValueType | UserProfileKVMapType,
    ): Promise<void> {
        if (typeof dataOrKey === 'string') {
            if (keyValue === undefined) {
                throw new Error(`PushSDK.UserProfile.set(key, value) requires value to be passed.`);
            }

            return this.bridge.setUserProfileKV(dataOrKey, keyValue);
        } else {
            if (!Object.keys(dataOrKey).length) {
                Logger.info('Empty object passed for UserProfile.set(data). Skipping profile update.');
                return;
            }

            return this.bridge.setUserProfileData(dataOrKey);
        }
    }

    static async append(key: string, values: UserProfileValueType[]): Promise<void> {
        return this.bridge.appendUserProfileValues(key, values);
    }

    static async remove(key: string, values: UserProfileValueType[]): Promise<void> {
        return this.bridge.removeUserProfileValues(key, values);
    }

    static async trackActivity(name: string, tags?: string[]): Promise<void> {
        return this.bridge.trackActivity(name, tags);
    }
}
