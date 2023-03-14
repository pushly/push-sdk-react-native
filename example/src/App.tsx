import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as randomstring from 'randomstring';
import {
    PushSDK,
    LogLevel,
    UserProfileMap,
    SubscriberStatus,
    NotificationInteraction,
} from '@pushly/push-sdk-react-native';

export default function App() {
    const [userProfile, setUserProfile] = React.useState<UserProfileMap | null>(null);
    const [externalId, setExternalId] = React.useState<string | null>(null);

    /**
     * Configure the PushSDK
     */
    React.useEffect(() => {
        PushSDK.setLogLevel(LogLevel.VERBOSE);
        PushSDK.setConfiguration({ appKey: 'REPLACE_WITH_SDK_KEY' });

        AsyncStorage.getItem('@externalId').then(xid => {
            if (!xid) {
                xid = randomstring.generate({ length: 8 });
                AsyncStorage.setItem('@externalId', xid);
            }

            setExternalId(xid);
            PushSDK.UserProfile.setExternalId(xid);
        });

        PushSDK.showNativeNotificationPermissionPrompt().then(({ granted }) => {
            console.info(`User accepted permissions: ${granted}`);
            PushSDK.UserProfile.getProperties().then(setUserProfile);
        });

        PushSDK.registerPermissionLifecycleCallbacks({
            onPushSDKDidRegisterForRemoteNotificationsWithDeviceToken(token: string) {
                console.info(`User received device token: ${token}`);
                PushSDK.UserProfile.getProperties().then(setUserProfile);
            },
        });

        PushSDK.registerNotificationLifecycleCallbacks({
            onPushSDKDidReceiveNotificationDestination(destination: string, _interaction: NotificationInteraction) {
                console.info(`Received notification click destination: ${destination}`);
                return false;
            },
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.label}>Anonymous ID:</Text>
                <Text>{userProfile?.anonymousId ?? 'Not Available'}</Text>
            </View>
            <View style={styles.spacer}/>
            <View style={styles.box}>
                <Text style={styles.label}>External ID:</Text>
                <Text>{userProfile?.externalId ?? `Setting: ${externalId}` ?? 'None'}</Text>
            </View>
            <View style={styles.spacer}/>
            <View style={styles.box}>
                <Text style={styles.label}>Subscription Status:</Text>
                <Text>{userProfile?.subscriberStatus !== undefined
                    ? SubscriberStatus[userProfile.subscriberStatus]
                    : 'Loading...'}</Text>
            </View>
            <View style={styles.spacer}/>
            <View style={styles.box}>
                <Text style={styles.label}>Token:</Text>
                <Text>{userProfile?.token ?? 'Not Available'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    box: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    spacer: {
        flex: .04,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    label: {
        fontWeight: '700',
    },
});
