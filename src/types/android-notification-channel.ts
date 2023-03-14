import type { AndroidLightConfig } from './android-light-config';
import type { AndroidVibrationConfig } from './android-vibration-config';

export type AndroidNotificationChannel = {
    identifier: string
    name: string
    importance: number
    description: string | null
    groupId: string | null
    sound: string | null
    lights: AndroidLightConfig
    vibration: AndroidVibrationConfig
    showBadge: boolean
    lockScreenVisibility: number
    isDefault: boolean
}
