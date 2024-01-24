import { NativeModules } from 'react-native'

type LiveActivityModule = {
    startLiveActivity(activityId: string): Promise<void>
}

export default NativeModules.LiveActivity as LiveActivityModule
