/** @module logging-utils */
import { IIndexed } from "@util/type-utils";
declare const LOG_LEVEL_MAP: {
    [x: string]: string;
};
declare const REVERSED_LOG_LEVEL_MAP: IIndexed;
declare class LogUtils {
    /**
     * Attempts to set the system log level from an ENV VAR ($LOG_LEVEL)
     * The Var can be a string representation of the level name or a numeric-like string
     * If the ENV VAR is not present sets to DEBUG as the default
     * @returns {number}
     */
    static getSystemLogLevel(): number;
    /**
     * Attempts to convert a numeric-like string to a log level
     * @returns {number}
     */
    static getNumericLogLevel(): number | null;
    /**
     * Attempts to set the system log entry max length from an ENV VAR (MAX_LOG_LENGTH)
     * If the ENV VAR is not present sets to 20000 as the default
     * @returns {number}
     */
    static getMaxLogLength(): number;
}
declare type loggable = string | Object | number | boolean | Error;
interface ILogItem {
    event: loggable;
    level: string;
    details?: loggable;
    err?: loggable;
    bindings?: Object;
    limitOutput?: boolean;
    maxLogLength?: number;
    [propName: string]: any;
}
interface ILogItemCollection {
    items: ILogItem[];
}
interface ILogEmitter {
    (event: loggable, details?: loggable, error?: loggable, bindings?: Object): void;
}
interface ILogItemFilter {
    (record: ILogItem): ILogItem;
}
interface ILogger {
    name: string;
    debug: ILogEmitter;
    info: ILogEmitter;
    warn: ILogEmitter;
    error: ILogEmitter;
    critical: ILogEmitter;
    bind(bindings: object): ILogger;
    close(): void;
}
export { ILogger, LogUtils, loggable, ILogItem, ILogItemCollection, ILogItemFilter, ILogEmitter, LOG_LEVEL_MAP, REVERSED_LOG_LEVEL_MAP };
