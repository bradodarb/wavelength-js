/** @module logging-utils */


import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import {IIndexed} from "@util/type-utils";

const LOG_LEVEL_MAP = {
    [bunyan.TRACE.toString()]: 'trace',
    [bunyan.DEBUG.toString()]: 'debug',
    [bunyan.INFO.toString()]: 'info',
    [bunyan.ERROR.toString()]: 'error',
    [bunyan.FATAL.toString()]: 'fatal',
};

const REVERSED_LOG_LEVEL_MAP: IIndexed = {
    trace: bunyan.TRACE,
    debug: bunyan.DEBUG,
    info: bunyan.INFO,
    error: bunyan.ERROR,
    fatal: bunyan.FATAL,
};


class LogUtils {
    /**
     * Attempts to set the system log level from an ENV VAR ($LOG_LEVEL)
     * The Var can be a string representation of the level name or a numeric-like string
     * If the ENV VAR is not present sets to DEBUG as the default
     * @returns {number}
     */
    static getSystemLogLevel(): number {

        if (!process.env.LOG_LEVEL) {
            return bunyan.DEBUG;
        }
        try {
            const numericLevel = LogUtils.getNumericLogLevel();
            if (numericLevel) {
                return numericLevel;
            }
            if (process.env.LOG_LEVEL) {
                const level: bunyan.LogLevelString = <bunyan.LogLevelString>process.env.LOG_LEVEL;
                return bunyan.levelFromName[level]
            }
            return bunyan.DEBUG;
        } catch (e) {
            console.error('Problem parsing log level', e);
        }
        return bunyan.DEBUG;
    }

    /**
     * Attempts to convert a numeric-like string to a log level
     * @returns {number}
     */
    static getNumericLogLevel() {

        if (process.env.LOG_LEVEL) {
            const level = parseInt(process.env.LOG_LEVEL, 10);
            if (_.isFinite(level)) {
                if (bunyan.nameFromLevel[level]) {
                    return level;
                }
            }
        }
        return null;
    }

    /**
     * Attempts to set the system log entry max length from an ENV VAR (MAX_LOG_LENGTH)
     * If the ENV VAR is not present sets to 20000 as the default
     * @returns {number}
     */
    static getMaxLogLength() {
        let maxLength = 20000;
        if (process.env.MAX_LOG_LENGTH) {
            const check = parseInt(process.env.MAX_LOG_LENGTH, 10);
            if (_.isFinite(check)) {
                maxLength = check;
            }
        }
        return maxLength;
    }
}

type loggable = string | Object | number | boolean | Error

interface ILogItem {
    event: loggable;
    level: string,
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
    bind(bindings: object):ILogger;
    close():void;
}

export {ILogger, LogUtils, loggable, ILogItem, ILogItemCollection, ILogItemFilter, ILogEmitter, LOG_LEVEL_MAP, REVERSED_LOG_LEVEL_MAP}
