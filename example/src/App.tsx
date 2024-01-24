import * as React from 'react';
import {
    View,
    Text,
    Platform,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as randomstring from 'randomstring';
import {
    PushSDK,
    LogLevel,
    UserProfileMap,
    SubscriberStatus,
    NotificationInteraction,
} from '@pushly/push-sdk-react-native';
import { ColumnView } from './components/column-view'
import { VerticalSpace } from './components/vertical-space'
import { KVView } from './components/kv-view'
import { useState } from 'react'
import { KVInputView } from './components/kv-input-view'
import LiveActivities from './modules/live-activities'
import { ButtonView } from './components/button-view'

export default function App() {
    const [askingPermission, setAskingPermission] = useState(false);
    const [userProfileData, setUserProfileData] = useState<UserProfileMap>({} as any);
    const [externalId, setExternalId] = React.useState<string | null>(null);
    const [liveActivityId, setLiveActivityId] = React.useState<string>('la_demo');

    const getUserProps = async () => {
        const userProps = await PushSDK.UserProfile.getProperties();
        if (userProps != null) {
            setUserProfileData(userProps);
        }
    };

    const askPermission = async () => {
        setAskingPermission(true);
        const granted = await PushSDK.showNativeNotificationPermissionPrompt()
        console.info(`User accepted permissions: ${granted}`);
        await getUserProps();
        setAskingPermission(false);
    };

    const startLiveActivity = async () => {
        await LiveActivities.startLiveActivity(liveActivityId);
    }

    /**
     * Configure the PushSDK
     */
    const appKey = 'REPLACE_WITH_SDK_KEY'

    React.useEffect(() => {
        PushSDK.setLogLevel(LogLevel.VERBOSE);
        PushSDK.setConfiguration({ appKey });

        AsyncStorage.getItem('@externalId').then(xid => {
            if (!xid) {
                xid = randomstring.generate({ length: 8 });
                AsyncStorage.setItem('@externalId', xid);
            }

            setExternalId(xid);
            PushSDK.UserProfile.setExternalId(xid);

            return getUserProps();
        });

        PushSDK.registerPermissionLifecycleCallbacks({
            onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken(token: string) {
                console.info(`User received device token: ${token}`);
                getUserProps();
            },
        });

        PushSDK.registerNotificationLifecycleCallbacks({
            onPushSDKDidReceiveNotificationDestination(destination: string, _interaction: NotificationInteraction) {
                console.info(`Received notification click destination: ${destination}`);
                return false;
            },
        });
    }, []);

    const subscriptionStatusValue = userProfileData.subscriberStatus != null ? SubscriberStatus[userProfileData.subscriberStatus] : 'Loading...'
    const externalIdValue = userProfileData.externalId ?? `<${externalId}>` ?? 'None'
    const anonymousIdValue = userProfileData.anonymousId ?? 'Loading...'
    const showPromptDisabled = askingPermission || userProfileData.isSubscribed || userProfileData.isDeleted || false

    return (
        <ColumnView flex={1} padding={30}>
            {Platform.OS === 'ios' && (
                <VerticalSpace space={10} />
            )}
            <ColumnView>
                <Text style={{
                    fontWeight: "900",
                    fontSize: 18
                }}>
                    ReactNativePushSDK
                </Text>
                {(askingPermission) && (
                    <ActivityIndicator size="small" />
                )}
            </ColumnView>
            <VerticalSpace space={10} />
            <KVView
                label="App Key"
                value={appKey}
            />
            <VerticalSpace space={4} />
            <KVView
                label="Anonymous ID"
                value={anonymousIdValue}
            />
            <VerticalSpace space={4} />
            <KVView
                label="External ID"
                value={externalIdValue}
            />
            <VerticalSpace space={4} />
            <KVView
                label="Subscription Status"
                value={subscriptionStatusValue}
            />
            <VerticalSpace space={4} />
            <KVView
                label="Token"
                value={userProfileData.token ?? 'Not Available'}
            />
            <VerticalSpace space={4} />
            <View>
                <ButtonView
                    label="Show Prompt"
                    disabled={showPromptDisabled}
                    onPress={() => askPermission()}
                />
            </View>
            <VerticalSpace space={4} />
            <KVInputView
                label="Live Activity ID"
                defaultValue={liveActivityId}
                onChange={setLiveActivityId}
            />
            <VerticalSpace space={4} />
            <View>
                <ButtonView
                    label="Start Live Activity"
                    onPress={() => startLiveActivity()}
                />
            </View>
            <VerticalSpace space={100} />
        </ColumnView>
    );
}

