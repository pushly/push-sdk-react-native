export class PushSDKException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, PushSDKException.prototype)
    }
}
