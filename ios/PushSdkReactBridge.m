#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@import Pushly;

@interface RCT_EXTERN_MODULE(PushSdkReactBridge, RCTEventEmitter)

#pragma mark - PushSDK Methods

RCT_EXTERN_METHOD(getLogLevel:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setLogLevel:(NSString)level)

#pragma mark - Delegate handlers

RCT_EXTERN_METHOD(registerPushSDKLifecycleCallbacks)

RCT_EXTERN_METHOD(registerPermissionLifecycleCallbacks)

RCT_EXTERN_METHOD(registerNotificationLifecycleCallbacks:(BOOL)withCustomDestinationHandler)

RCT_EXTERN_METHOD(completeNotificationDestinationInteraction:(NSString *)iid
                  clientHandled:(BOOL)handled)

#pragma mark - Core

RCT_EXTERN_METHOD(setConfiguration:(NSString)appKey)

RCT_EXTERN_METHOD(showNativeNotificationPermissionPrompt:(BOOL)skipConditions
                  skipFrequencyCapEvaluation:(BOOL)skipFcap
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

#pragma mark - UserProfile Methods

RCT_EXTERN_METHOD(getUserProfileMap:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAnonymousId:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getExternalId:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setExternalId:(NSString)externalId)

RCT_EXTERN_METHOD(getIsSubscribed:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSubscriberStatus:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getToken:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getIsEligibleToPrompt:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getIsUserDeleted:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestUserDeletion)

// FIXME: objc id:any
RCT_EXTERN_METHOD(setUserProfileKV:(NSString *)key
                  withValue:(id)value)

RCT_EXTERN_METHOD(setUserProfileData:(NSDictionary *)data)

RCT_EXTERN_METHOD(appendUserProfileValues:(NSString *)key
                  values:(NSArray *)values)

RCT_EXTERN_METHOD(removeUserProfileValues:(NSString *)key
                  values:(NSArray *)values)

RCT_EXTERN_METHOD(trackActivity:(NSString *)name
                  withTags:(NSArray *)tags)

#pragma mark - EComm Methods

RCT_EXTERN_METHOD(addToCart:(NSArray *)items
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateCart:(NSArray *)items
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearCart:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackPurchase:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackItemsPurchase:(NSArray *)items
                  withPurchaseId:(NSString *)purchaseId
                  withPriceValue:(NSString *)priceValue
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
