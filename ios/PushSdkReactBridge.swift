import React
import Pushly

internal enum SendableEvent {
    static let didFinishLoading = "onPushSDKDidFinishLoading"
    static let didExit = "onPushSDKDidExitWithSubscriberStatus"
    static let didRegisterForNotifications = "onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken"
    static let didFailToRegisterForNotifications = "onPushSDKDidFailToRegisterForRemoteNotificationsWithError"
    static let didReceivePermissionResponse = "onPushSDKDidReceivePermissionResponse"
    static let didReceivePermissionResponseWithError = "onPushSDKDidReceivePermissionResponseWithError"
    static let didReceiveNotification = "onPushSDKDidReceiveRemoteNotification"
    static let didReceiveNotificationDestination = "onPushSDKDidReceiveNotificationDestination"
}

internal let MODULE_VERSION = "1.1.0";
internal let PNLogs = PNLogger(name: "PushSDK SWBridge")

@objc(PushSdkReactBridge)
class PushSdkReactBridge: RCTEventEmitter, PNPushSDKLifecycleDelegate, PNPermissionsLifecycleDelegate, PNNotificationLifecycleDelegate {
    @objc
    override init() {
        super.init()

        PushSDK.setEventSourceApplication(PNEventSourceApplication(
            name: "pushly-sdk-react-native",
            version: MODULE_VERSION
        ))
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // MARK: - Logging

    @objc(getLogLevel:withRejecter:)
    func getLogLevel(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.logLevel.name.uppercased())
    }

    @objc(setLogLevel:)
    func setLogLevel(_ level: String) {
        let logLevel: PNLogLevel
        switch (level.uppercased()) {
            case "VERBOSE": logLevel = PNLogLevel.verbose; break
            case "DEBUG": logLevel = PNLogLevel.debug; break
            case "INFO": logLevel = PNLogLevel.info; break
            case "WARN": logLevel = PNLogLevel.warn; break
            case "ERROR": logLevel = PNLogLevel.error; break
            case "CRITICAL": logLevel = PNLogLevel.critical; break
            case "NONE": fallthrough
            default: logLevel = PNLogLevel.none
        }

        PNLogs.logLevel = logLevel
        PushSDK.logLevel = logLevel
    }

    // MARK: - Delegate Handlers

    var _hasCustomDestinationHandler = false

    @objc(registerPushSDKLifecycleCallbacks)
    func registerPushSDKLifecycleCallbacks() {
        PushSDK.setSDKLifecycleDelegate(self)
    }

    @objc(registerPermissionLifecycleCallbacks)
    func registerPermissionLifecycleCallbacks() {
        PushSDK.setPermissionsLifecycleDelegate(self)
    }

    @objc(registerNotificationLifecycleCallbacks:)
    func registerNotificationLifecycleCallbacks(withCustomDestinationHandler: Bool) {
        _hasCustomDestinationHandler = withCustomDestinationHandler
        PushSDK.setNotificationLifecycleDelegate(self)
    }

    func pushSDK(didFinishLoading configuration: PNApplicationConfig, withNotificationSettings settings: UNNotificationSettings) {
        sendEvent(withName: SendableEvent.didFinishLoading, body: [
            "configuration": configuration.toSimpleObject(),
            "subscriberStatus": PushSDK.UserProfile.subscriberStatus.stringValue.uppercased(),
        ] as [AnyHashable : Any])
    }

    func pushSDK(didExitWithSubscriberStatus status: PNSubscriberStatus, withDeletedState deleted: Bool) {
        sendEvent(withName: SendableEvent.didExit, body: [
            "status": status.stringValue.uppercased(),
            "deleted": deleted,
        ] as [AnyHashable : Any])
    }

    func pushSDK(didReceivePermissionResponse granted: Bool, withSettings settings: UNNotificationSettings) {
        sendEvent(withName: SendableEvent.didReceivePermissionResponse, body: [
            "response": parsePermissionResponse(granted: granted, withSettings: settings),
        ] as [AnyHashable : Any])
    }

    func pushSDK(didReceivePermissionResponse granted: Bool, withSettings settings: UNNotificationSettings, withError error: Error) {
        sendEvent(withName: SendableEvent.didReceivePermissionResponseWithError, body: [
            "response": parsePermissionResponse(granted: granted, withSettings: settings),
            "error": error.localizedDescription
        ] as [AnyHashable : Any])
    }

    func pushSDK(didRegisterForRemoteNotificationsWithDeviceToken deviceToken: String) {
        sendEvent(withName: SendableEvent.didRegisterForNotifications, body: [
            "token": deviceToken,
        ])
    }

    func pushSDK(didFailToRegisterForRemoteNotificationsWithError error: Error) {
        sendEvent(withName: SendableEvent.didFailToRegisterForNotifications, body: [
            "error": error.localizedDescription,
        ])
    }

    func pushSDK(didReceiveNotification notification: PNNotification) {
        sendEvent(withName: SendableEvent.didReceiveNotification, body: [
            "notification": notification.toSimpleObject()
        ] as [AnyHashable : Any])
    }

    func pushSDK(didReceiveNotificationDestination destination: String, withInteraction interaction: PNNotificationInteraction) -> Bool {
        let iid = "\(interaction.notification.id):\(interaction.actionIdentifier)"
        if _hasCustomDestinationHandler {
            PNLogs.verbose("Registering unhandled interaction: \(iid)")
            unhandledInteractions[iid] = (destination, interaction)
        }

        sendEvent(withName: SendableEvent.didReceiveNotificationDestination, body: [
            "destination": destination,
            "interaction": interaction.toSimpleObject(),
            "iid": iid,
        ] as [AnyHashable : Any])

        return _hasCustomDestinationHandler
    }

    var unhandledInteractions: Dictionary<String, (String, PNNotificationInteraction)> = [:]

    @objc(completeNotificationDestinationInteraction:clientHandled:)
    func completeNotificationDestinationInteraction(iid: String, clientHandled handled: Bool) {
        if let (destination, interaction) = unhandledInteractions.removeValue(forKey: iid) {
            PNLogs.verbose("Completing unhandled interaction: \(iid)")

            if handled {
                PNLogs.debug("Notification destination handled by client")
            } else {
                PNNotificationOpenedProcessor.processInteractionDestination(interaction, destination: destination)
            }
        }
    }

    // MARK: - Core

    var _pushSdkConfigured = false;

    @objc(setConfiguration:)
    func setConfiguration(_ appKey: String) {
        guard (!_pushSdkConfigured) else {
            PNLogs.warn("React-Native PushSDK already initialized. " +
                        "Please ensure setConfiguration is only called once.")
            return
        }
        _pushSdkConfigured = true
        PNLogs.verbose("Configuring React-Native PushSDK")

        dispatchAsyncOnMainQueue {
            PushSDK.setConfiguration(
                appKey: appKey,
                withLaunchOptions: self.bridge.launchOptions as! [UIApplication.LaunchOptionsKey : Any]?
            )
        }
    }

    @objc(showNativeNotificationPermissionPrompt:skipFrequencyCapEvaluation:withResolver:withRejecter:)
    func showNativeNotificationPermissionPrompt(
        skipConditionsEvaluation skipConditions: Bool,
        skipFrequencyCapEvaluation skipFcap: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        dispatchAsyncOnMainQueue {
            PushSDK.showNativeNotificationPermissionPrompt(
                { granted, settings, error in
                    guard error == nil else {
                        let error = error! as NSError
                        reject(String(error.code), error.localizedDescription, error)
                        return
                    }

                    resolve([
                        "granted": granted,
                        "status": PNSubscriberStatus.subscribed.stringValue.uppercased(),
                    ] as [AnyHashable : Any])
                },
                skipConditionsEvaluation: skipConditions,
                skipFrequencyCapEvaluation: skipFcap
            )
        }
    }

    // MARK: - UserProfile

    @objc(getUserProfileMap:withRejecter:)
    func getUserProfileMap(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve([
            "anonymousId": PushSDK.UserProfile.anonymousId,
            "externalId": PushSDK.UserProfile.externalId,
            "isSubscribed": PushSDK.UserProfile.isSubscribed,
            "subscriberStatus": PushSDK.UserProfile.subscriberStatus.stringValue.uppercased(),
            "token": PushSDK.UserProfile.token,
            "isEligibleToPrompt": PushSDK.UserProfile.isEligibleToPrompt,
            "isDeleted": PushSDK.UserProfile.isDeleted,
        ] as [AnyHashable : Any?])
    }

    @objc(getAnonymousId:withRejecter:)
    func getAnonymousId(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.anonymousId)
    }

    @objc(getExternalId:withRejecter:)
    func getExternalId(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.externalId)
    }

    @objc(setExternalId:)
    func setExternalId(_ externalId: String) {
        PushSDK.UserProfile.externalId = externalId
    }

    @objc(getIsSubscribed:withRejecter:)
    func getIsSubscribed(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.isSubscribed)
    }

    @objc(getSubscriberStatus:withRejecter:)
    func getSubscriberStatus(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.subscriberStatus.stringValue.uppercased())
    }

    @objc(getToken:withRejecter:)
    func getToken(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.token)
    }

    @objc(getIsEligibleToPrompt:withRejecter:)
    func getIsEligibleToPrompt(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.isEligibleToPrompt)
    }

    @objc(getIsUserDeleted:withRejecter:)
    func getIsUserDeleted(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        resolve(PushSDK.UserProfile.isDeleted)
    }

    @objc(requestUserDeletion)
    func requestUserDeletion() {
        PushSDK.UserProfile.requestUserDeletion()
    }

    @objc(setUserProfileKV:withValue:)
    func setUserProfileKV(_ key: String, withValue value: Any) {
        PushSDK.UserProfile.set(value, forKey: key)
    }

    @objc(setUserProfileData:)
    func setUserProfileData(_ data: [AnyHashable : Any]) {
        PushSDK.UserProfile.set(data.toStringDict())
    }

    @objc(appendUserProfileValues:values:)
    func appendUserProfileValues(_ key: String, values: [AnyHashable]) {
        PushSDK.UserProfile.append(values.toStringList(), to: key)
    }

    @objc(removeUserProfileValues:values:)
    func removeUserProfileValues(_ key: String, values: [AnyHashable]) {
        PushSDK.UserProfile.remove(values.toStringList(), from: key)
    }

    @objc(trackActivity:withTags:)
    func trackActivity(
        _ name: String,
        withTags tags: [AnyHashable]? = nil
    ) {
        if let tags {
            PushSDK.UserProfile.trackActivity(name: name, withTags: tags.toStringList())
        } else {
            PushSDK.UserProfile.trackActivity(name: name)
        }
    }

    // MARK: - EComm

    @objc(addToCart:withResolver:withRejecter:)
    func addToCart(
        _ items: [[AnyHashable : Any]],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        PushSDK.EComm.addToCart(items: convertToPNECommItemList(items))
        resolve(nil)
    }

    @objc(updateCart:withResolver:withRejecter:)
    func updateCart(
        _ items: [[AnyHashable : Any]],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        PushSDK.EComm.updateCart(withItems: convertToPNECommItemList(items))
        resolve(nil)
    }

    @objc(clearCart:withRejecter:)
    func clearCart(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        PushSDK.EComm.clearCart()
        resolve(nil)
    }

    @objc(trackPurchase:withRejecter:)
    func trackPurchase(
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        PushSDK.EComm.trackPurchase()
        resolve(nil)
    }

    @objc(trackItemsPurchase:withPurchaseId:withPriceValue:withResolver:withRejecter:)
    func trackItemsPurchase(
        items: [[AnyHashable : Any]],
        purchaseId: String? = nil,
        priceValue: String? = nil,
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        PushSDK.EComm.trackPurchase(
            of: convertToPNECommItemList(items),
            withPurchaseId: purchaseId,
            withPriceValue: priceValue
        )
        resolve(nil)
    }

    // MARK: - RCTEventEmitter Methods

    override func supportedEvents() -> [String]! {
        return [
            SendableEvent.didFinishLoading,
            SendableEvent.didExit,
            SendableEvent.didRegisterForNotifications,
            SendableEvent.didFailToRegisterForNotifications,
            SendableEvent.didReceivePermissionResponse,
            SendableEvent.didReceivePermissionResponseWithError,
            SendableEvent.didReceiveNotification,
            SendableEvent.didReceiveNotificationDestination,
        ]
    }

    // MARK: - Helpers

    private func dispatchAsyncOnMainQueue(
        _ dispatcher: @escaping () -> Void
    ) {
        DispatchQueue.main.async(execute: dispatcher)
    }

    private func parsePermissionResponse(granted: Bool, withSettings settings: UNNotificationSettings) -> String {
        switch ((granted, settings.authorizationStatus)) {
            case (true, _):
                return "GRANTED"
            case (false, .notDetermined):
                return "DISMISSED"
            default:
                return "DENIED"
        }
    }
}

private func convertToPNECommItemList(_ rawItems: [[AnyHashable : Any]]) -> [PNECommItem] {
    rawItems.map { item in
        PNECommItem(
            id: item["id"] as? String ?? String(describing: item["id"]),
            quantity: item["quantity"] as? Int ?? 0
        )
    }
}

private extension [AnyHashable] {
    func toStringList() -> [String] {
        return map { v in
            if let str = v as? String {
                return str
            } else {
                return String(describing: v)
            }
        }
    }
}

private extension [AnyHashable : Any] {
    func toStringDict() -> [String : Any] {
        var dict = [String : Any]()
        forEach { k, v in
            if let strKey = k as? String {
                dict[strKey] = v
            } else {
                dict[String(describing: k)] = v
            }
        }
        return dict
    }
}
