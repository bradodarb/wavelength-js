import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import {Indexed, Serializable} from "../util";



const LOG_LEVEL_MAP = {
    [bunyan.TRACE.toString()]: 'trace',
    [bunyan.DEBUG.toString()]: 'debug',
    [bunyan.INFO.toString()]: 'info',
    [bunyan.ERROR.toString()]: 'error',
    [bunyan.FATAL.toString()]: 'fatal',
};

const REVERSED_LOG_LEVEL_MAP: Indexed = {
    trace: bunyan.TRACE,
    debug: bunyan.DEBUG,
    info: bunyan.INFO,
    error: bunyan.ERROR,
    fatal: bunyan.FATAL,
};

interface LogItem {
    event: Serializable;
    level: string,
    details?: Serializable;
    err?: Serializable;
    bindings?: Object;
    limitOutput?: boolean;
    maxLogLength?: number;

    [propName: string]: any;
}

interface LogItemCollection {
    items: LogItem[];
}

interface LogEmitter {
    (event: Serializable, details?: Serializable, bindings?: Object): void;
    (event: Serializable, details?: Serializable, error?: Serializable, bindings?: Object): void;
}

interface LogItemFilter {
    (record: LogItem): LogItem;
}

interface StructuredLogger {
    name: string;
    debug: LogEmitter;
    info: LogEmitter;
    warn: LogEmitter;
    error: LogEmitter;
    critical: LogEmitter;
    bind(bindings: object):StructuredLogger;
    close():void;
}

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



export {StructuredLogger, LogUtils, LogItem, LogItemCollection, LogItemFilter, LogEmitter, LOG_LEVEL_MAP, REVERSED_LOG_LEVEL_MAP}
