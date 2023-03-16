package com.pushly.reactnative

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageInfo
import android.os.Handler
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.pushly.android.PushSDK
import com.pushly.android.PNLogger
import com.pushly.android.PNNotificationOpenedProcessor
import com.pushly.android.callbacks.PNNotificationLifecycleCallbacks
import com.pushly.android.callbacks.PNPermissionLifecycleCallbacks
import com.pushly.android.callbacks.PNPushSDKLifecycleCallbacks
import com.pushly.android.enums.PNLogLevel
import com.pushly.android.enums.PNPermissionResponse
import com.pushly.android.enums.PNSubscriberStatus
import com.pushly.android.models.PNApplicationConfig
import com.pushly.android.models.PNEventSourceApplication
import com.pushly.android.models.PNNotification
import com.pushly.android.models.PNNotificationInteraction

internal enum class SendableEvent(val eventName: String) {
    DID_FINISH_LOADING("onPushSDKDidFinishLoading"),
    DID_EXIT("onPushSDKDidExitWithSubscriberStatus"),
    DID_REGISTER_FOR_NOTIFICATIONS("onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken"),
    DID_FAIL_TO_REGISTER_FOR_NOTIFICATIONS("onPushSDKDidFailToRegisterForRemoteNotificationsWithError"),
    DID_RECEIVE_PERMISSION_RESPONSE("onPushSDKDidReceivePermissionResponse"),
    DID_RECEIVE_NOTIFICATION("onPushSDKDidReceiveRemoteNotification"),
    DID_RECEIVE_NOTIFICATION_DESTINATION("onPushSDKDidReceiveNotificationDestination"),
}

internal val PNLogs = PNLogger(name = "PushSDK KTBridge")

class PushSdkReactNativeModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener,
    LifecycleEventListener {
    companion object {
        init {
            PushSDK.setEventSourceApplication(PNEventSourceApplication(
                name = "pushly-sdk-react-native",
                version = BuildConfig.SDK_VERSION_CODE
            ))
        }

        internal const val MODULE_NAME = "PushSdkReactBridge"
    }

    private var isColdLaunch = true
    private val pInfo: PackageInfo =
        reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)

    private var pushSdkConfigured = false

    // Listen for new intents when app is in the background
    // Listen for resume events when it is cold started, or in the background
    init {
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName() = MODULE_NAME

    // region Logging
    @ReactMethod
    fun getLogLevel(promise: Promise) =
        promise.resolve(PushSDK.logLevel.name)

    @ReactMethod
    fun setLogLevel(level: String) {
        val logLevel = when (level.uppercase()) {
            PNLogLevel.VERBOSE.name -> PNLogLevel.VERBOSE
            PNLogLevel.DEBUG.name -> PNLogLevel.DEBUG
            PNLogLevel.INFO.name -> PNLogLevel.INFO
            PNLogLevel.WARN.name -> PNLogLevel.WARN
            PNLogLevel.ERROR.name -> PNLogLevel.ERROR
            PNLogLevel.CRITICAL.name -> PNLogLevel.CRITICAL
            PNLogLevel.NONE.name -> PNLogLevel.NONE
            else -> PNLogLevel.NONE
        }

        PNLogs.logLevel = logLevel
        PushSDK.logLevel = logLevel
    }
    // endregion

    // region Lifecycle Handlers
    @ReactMethod
    fun registerPushSDKLifecycleCallbacks() {
        PushSDK.registerPushSDKLifecycleCallbacks(object : PNPushSDKLifecycleCallbacks {
            override fun onPushSDKDidFinishLoading(
                configuration: PNApplicationConfig,
                subscriberStatus: PNSubscriberStatus
            ) {
                emitEvent(SendableEvent.DID_FINISH_LOADING.eventName, mapOf(
                    "configuration" to configuration.toSimpleObject(),
                    "subscriberStatus" to subscriberStatus.name,
                ).toReadableMap())
            }

            override fun onPushSDKDidExitWithSubscriberStatus(
                status: PNSubscriberStatus,
                deleted: Boolean
            ) {
                emitEvent(SendableEvent.DID_EXIT.eventName, mapOf(
                    "status" to status.name,
                    "deleted" to deleted,
                ).toReadableMap())
            }
        })
    }

    @ReactMethod
    fun registerPermissionLifecycleCallbacks() {
        PushSDK.registerPermissionLifecycleCallbacks(object : PNPermissionLifecycleCallbacks {
            override fun onPushSDKDidReceivePermissionResponse(response: PNPermissionResponse) {
                emitEvent(SendableEvent.DID_RECEIVE_PERMISSION_RESPONSE.eventName, mapOf(
                    "response" to response.name.uppercase(),
                ).toReadableMap())
            }

            override fun onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken(token: String) {
                emitEvent(SendableEvent.DID_REGISTER_FOR_NOTIFICATIONS.eventName, mapOf(
                    "token" to token,
                ).toReadableMap())
            }

            override fun onPushSDKDidFailToRegisterForRemoteNotificationsWithError(error: Throwable) {
                emitEvent(SendableEvent.DID_FAIL_TO_REGISTER_FOR_NOTIFICATIONS.eventName, mapOf(
                    "error" to error.message,
                ).toReadableMap())
            }
        })
    }

    var unhandledInteractions: MutableMap<String, PNNotificationInteraction> = mutableMapOf()

    @ReactMethod
    fun registerNotificationLifecycleCallbacks(overrideDestinationHandler: Boolean) {
        PushSDK.registerNotificationLifecycleCallbacks(object : PNNotificationLifecycleCallbacks {
            override fun onPushSDKDidReceiveRemoteNotification(notification: PNNotification) {
                emitEvent(SendableEvent.DID_RECEIVE_NOTIFICATION.eventName, mapOf(
                    "notification" to notification.toSimpleObject(),
                ).toReadableMap())
            }

            override fun onPushSDKDidReceiveNotificationDestination(
                destination: String,
                interaction: PNNotificationInteraction,
            ): Boolean {
                val iid = "${interaction.notification.id}:${interaction.actionIdentifier}"
                if (overrideDestinationHandler) {
                    PNLogs.verbose("Registering unhandled interaction: $iid")
                    unhandledInteractions[iid] = interaction
                }

                emitEvent(SendableEvent.DID_RECEIVE_NOTIFICATION_DESTINATION.eventName, mapOf(
                    "destination" to destination,
                    "interaction" to interaction.toSimpleObject(),
                    "iid" to iid,
                ).toReadableMap())

                return overrideDestinationHandler
            }
        })
    }

    @ReactMethod
    fun completeNotificationDestinationInteraction(
        iid: String,
        clientHandled: Boolean,
    ) {
        unhandledInteractions.remove(iid)?.let { interaction ->
            PNLogs.verbose("Completing unhandled interaction: $iid")

            if (clientHandled) {
                PNLogs.debug("Notification destination handled by client")
            } else {
                PNNotificationOpenedProcessor.processInteractionDestination(interaction)
            }
        }
    }
    // endregion

    // region Core
    @ReactMethod
    fun setConfiguration(appKey: String) {
        if (pushSdkConfigured) {
            PNLogs.warn("React-Native PushSDK already initialized " +
                    "Please ensure setConfiguration is only called once.")
            return
        }
        pushSdkConfigured = true
        PNLogs.verbose("Configuring React-Native PushSDK")

        dispatchAsyncOnMainThread {
            PushSDK.setConfiguration(
                appKey = appKey,
                context = reactContext.applicationContext,
            )
        }
    }

    @ReactMethod
    fun showNativeNotificationPermissionPrompt(
        skipConditionsEvaluation: Boolean = false,
        skipFrequencyCapEvaluation: Boolean = false,
        promise: Promise,
    ) {
        dispatchAsyncOnMainThread {
            PushSDK.showNativeNotificationPermissionPrompt(
                completion = { granted, status, error ->
                    if (error != null) {
                        promise.reject(error)
                    } else {
                        promise.resolve(
                            mapOf(
                                "granted" to granted,
                                "status" to status!!.name.uppercase(),
                            ).toReadableMap()
                        )
                    }
                },
                skipConditionsEvaluation,
                skipFrequencyCapEvaluation,
            )
        }
    }
    // endregion
    // region UserProfile
    @ReactMethod
    fun getUserProfileMap(promise: Promise) = runRejectable(promise) {
        mapOf(
            "anonymousId" to PushSDK.UserProfile.anonymousId,
            "externalId" to PushSDK.UserProfile.externalId,
            "isSubscribed" to PushSDK.UserProfile.isSubscribed,
            "subscriberStatus" to PushSDK.UserProfile.subscriberStatus.name.uppercase(),
            "token" to PushSDK.UserProfile.token,
            "isEligibleToPrompt" to PushSDK.UserProfile.isEligibleToPrompt,
            "isDeleted" to PushSDK.UserProfile.isDeleted,
        ).toReadableMap()
    }

    @ReactMethod
    fun getAnonymousId(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.anonymousId
    }

    @ReactMethod
    fun getExternalId(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.externalId
    }

    @ReactMethod
    fun setExternalId(id: String) {
        PushSDK.UserProfile.externalId = id
    }

    @ReactMethod
    fun getIsSubscribed(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.isSubscribed
    }

    @ReactMethod
    fun getSubscriberStatus(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.subscriberStatus.name.uppercase()
    }

    @ReactMethod
    fun getToken(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.token
    }

    @ReactMethod
    fun getIsEligibleToPrompt(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.isEligibleToPrompt
    }

    @ReactMethod
    fun getIsUserDeleted(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.isDeleted
    }

    @ReactMethod
    fun requestUserDeletion(promise: Promise) = runRejectable(promise) {
        PushSDK.UserProfile.requestUserDeletion()
    }

    @ReactMethod
    fun setUserProfileKV(key: String, value: Any) {
        PushSDK.UserProfile.set(key, value)
    }

    @ReactMethod
    fun setUserProfileData(data: ReadableMap) {
        PushSDK.UserProfile.set(data.toHashMap())
    }

    @ReactMethod
    fun appendUserProfileValues(key: String, values: ReadableArray) {
        PushSDK.UserProfile.append(key, values.toArrayList())
    }

    @ReactMethod
    fun removeUserProfileValues(key: String, values: ReadableArray) {
        PushSDK.UserProfile.remove(key, values.toArrayList())
    }

    @ReactMethod
    fun trackActivity(name: String, tags: ReadableArray? = null) {
        if (tags == null) {
            PushSDK.UserProfile.trackActivity(name)
        } else {
            PushSDK.UserProfile.trackActivity(name, tags.toStringList())
        }
    }
    // endregion

    // region EComm
    @ReactMethod
    fun addToCart(items: ReadableArray, promise: Promise) = runRejectable(promise) {
        PushSDK.EComm.addToCart(convertToPNECommItemList(items))
    }

    @ReactMethod
    fun updateCart(items: ReadableArray, promise: Promise) = runRejectable(promise) {
        PushSDK.EComm.updateCart(convertToPNECommItemList(items))
    }

    @ReactMethod
    fun clearCart(promise: Promise) = runRejectable(promise) {
        PushSDK.EComm.clearCart()
    }

    @ReactMethod
    fun trackPurchase(promise: Promise) = runRejectable(promise) {
        PushSDK.EComm.trackPurchase()
    }

    @ReactMethod
    fun trackItemsPurchase(
        items: ReadableArray,
        purchaseId: String? = null,
        priceValue: String? = null,
        promise: Promise,
    ) = runRejectable(promise) {
        val ecommItems = convertToPNECommItemList(items);

        if (priceValue != null) {
            PushSDK.EComm.trackPurchase(items = ecommItems, purchaseId, priceValue)
        } else if (purchaseId != null) {
            PushSDK.EComm.trackPurchase(items = ecommItems, purchaseId)
        } else {
            PushSDK.EComm.trackPurchase(items = ecommItems)
        }
    }
    // endregion

    //  region NativeEventEmitter
    @ReactMethod
    fun addListener(name: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private fun emitEvent(name: String, params: Any) {
        this.reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }
    // endregion

    // region Application Lifecycles
    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        // Do nothing
    }

    override fun onNewIntent(intent: Intent?) {
        // Do nothing
    }

    override fun onHostResume() {
        if (currentActivity != null && isColdLaunch) {
            isColdLaunch = false
        }
    }

    override fun onHostPause() {
        // Do nothing
    }

    override fun onHostDestroy() {
        isColdLaunch = true
        // Do nothing
    }
    // endregion

    // region Helpers
    private fun runRejectable(promise: Promise, block: () -> Any?) {
        runCatching {
            val value = block()
            promise.resolve(value)
        }.onFailure {
            promise.reject(it)
        }
    }

    private fun dispatchAsyncOnMainThread(runnable: Runnable) {
        if (this.reactContext.mainLooper.thread == Thread.currentThread()) {
            runnable.run()
        } else {
            Handler(this.reactContext.mainLooper).post(runnable)
        }
    }
    // endregion
}
