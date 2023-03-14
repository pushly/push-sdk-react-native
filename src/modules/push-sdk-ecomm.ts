import type { ECommItem } from '../types/ecomm-item';
import type { PushSdkReactBridge } from '../types/push-sdk-react-bridge';
import { NativeModules } from 'react-native';
import { RCT_BRIDGE_NAME } from '../constants';

export class PushSDKEComm {
    private static readonly bridge: PushSdkReactBridge = NativeModules[RCT_BRIDGE_NAME];

    static addToCart(items: ECommItem[]): Promise<void> {
        return this.bridge.addToCart(items);
    }

    static updateCart(items: ECommItem[]): Promise<void> {
        return this.bridge.updateCart(items);
    }

    static clearCart(): Promise<void> {
        return this.bridge.clearCart();
    }

    static trackPurchase(): Promise<void>;
    static trackPurchase(items: ECommItem[], purchaseId?: string, priceValue?: string): Promise<void>;
    static trackPurchase(items?: ECommItem[], purchaseId?: string, priceValue?: string): Promise<void> {
        if (!items) {
            return this.bridge.trackPurchase();
        } else {
            return this.bridge.trackItemsPurchase(items, purchaseId, priceValue);
        }
    }
}
