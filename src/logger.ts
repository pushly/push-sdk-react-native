import { LogLevel } from './enums/log-level';

export class Logger {
    static logLevel: LogLevel = LogLevel.NONE;

    static info(message: any, ...extra: any[]) {
        this.log(LogLevel.INFO, message, ...extra);
    }

    static debug(message: any, ...extra: any[]) {
        this.log(LogLevel.DEBUG, message, ...extra);
    }

    static warn(message: any, ...extra: any[]): void {
        this.log(LogLevel.WARN, message, ...extra);
    }

    static error(message: any, ...extra: any[]): void {
        this.log(LogLevel.ERROR, message, ...extra);
    }

    private static loggingLevelEnabled(level: LogLevel): boolean {
        return level != LogLevel.NONE
            && this.logLevel != LogLevel.NONE
            && level >= this.logLevel;
    }

    private static log(level: LogLevel, message: any, ...extra: any[]) {
        if (!this.loggingLevelEnabled(level)) {
            return;
        }

        const labeledMsg = `[PushSDK RN] ${message}`;

        switch (level) {
            case LogLevel.INFO:
                console.info(labeledMsg, ...extra);
                break;
            case LogLevel.DEBUG:
                console.debug(labeledMsg, ...extra);
                break;
            case LogLevel.WARN:
                console.warn(labeledMsg, ...extra);
                break;
            case LogLevel.ERROR:
                console.error(labeledMsg, ...extra);
                break;
            case LogLevel.CRITICAL:
                console.error('!!', labeledMsg, ...extra);
                break;
            case LogLevel.VERBOSE:
                console.debug('V!', labeledMsg, ...extra);
                break;
        }
    }
}
