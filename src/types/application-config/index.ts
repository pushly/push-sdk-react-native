import type { AppFrequencyCaps } from '../app-frequency-caps';
import type { ECommConfig } from '../ecomm-config';

export type ApplicationConfig = {
    appId: number
    appKey: string
    name: string
    flags: string[]
    frequencyCaps: AppFrequencyCaps | null
    ecommConfig: ECommConfig | null
}
