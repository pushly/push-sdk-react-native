import type { SubscriberStatus } from '../enums/subscriber-status';
import type { NativeModule } from 'react-native';
import type { ECommItem } from './ecomm-item';

export type UserProfileMap = {
    anonymousId: string
    externalId?: string
    isSubscribed: boolean
    subscriberStatus: SubscriberStatus
    token?: string
    isEligibleToPrompt: boolean
    isDeleted: boolean
}

type RawUserProfileMap = Omit<UserProfileMap, 'subscriberStatus'> & { subscriberStatus: string }
export type UserProfileKVMapType = { [key: string]: any }
export type UserProfileValueType = string | number | null

export type UserProfileReactBridge = {
    getUserProfileMap(): Promise<RawUserProfileMap>
    getAnonymousId(): Promise<string>
    getExternalId(): Promise<string>
    setExternalId(id: string): void
    getIsSubscribed(): Promise<boolean>
    getSubscriberStatus(): Promise<string>
    getToken(): Promise<string | null>
    getIsEligibleToPrompt(): Promise<boolean>
    getIsUserDeleted(): Promise<boolean>
    requestUserDeletion(): Promise<void>
    setUserProfileKV(key: string, value: UserProfileValueType | UserProfileKVMapType): Promise<void>
    setUserProfileData(data: UserProfileKVMapType): Promise<void>
    appendUserProfileValues(key: string, values: UserProfileValueType[]): Promise<void>
    removeUserProfileValues(key: string, values: UserProfileValueType[]): Promise<void>
    trackActivity(name: string, tags?: string[]): Promise<void>
}

export type EcommReactBridge = {
    addToCart(items: ECommItem[]): Promise<void>
    updateCart(items: ECommItem[]): Promise<void>
    clearCart(): Promise<void>
    trackPurchase(): Promise<void>
    trackItemsPurchase(items: ECommItem[], purchaseId?: string, priceValue?: string): Promise<void>
}

export type PushSdkReactBridge =
    NativeModule &
    UserProfileReactBridge &
    EcommReactBridge &
    {
        getConstants(): any

        getLogLevel(): Promise<string>
        setLogLevel(level: string): void

        registerPushSDKLifecycleCallbacks(): void
        registerPermissionLifecycleCallbacks(): void
        registerNotificationLifecycleCallbacks(overrideDestinationHandler: boolean): void
        completeNotificationDestinationInteraction(iid: string, clientHandled: boolean): void

        showNativeNotificationPermissionPrompt(
            skipConditionsEvaluation?: boolean,
            skipFrequencyCapEvaluation?: boolean
        ): Promise<{ granted: boolean, status: string }>

        setConfiguration(appKey: string): Promise<void>
    }
