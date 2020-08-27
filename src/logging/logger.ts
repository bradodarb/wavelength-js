import * as bunyan from 'bunyan';
import Logger from 'bunyan';
import * as _ from 'lodash';
import {LogEmitter, LogItem, LogUtils, StructuredLogger} from './util';
import {Indexed} from '../util';


class StructLog implements StructuredLogger {
    name: string;
    debug: LogEmitter;
    info: LogEmitter;
    warn: LogEmitter;
    error: LogEmitter;
    critical: LogEmitter;

    logger: Logger & Indexed;

    constructor(name: string, options: any = {}) {
        this.name = name;
        this.debug = this.getEmitter(bunyan.DEBUG);
        this.info = this.getEmitter(bunyan.INFO);
        this.warn = this.getEmitter(bunyan.WARN);
        this.error = this.getEmitter(bunyan.ERROR);
        this.critical = this.getEmitter(bunyan.FATAL);
        this.logger = this.getLogger(options);
    }

    bind(bindings: object): StructLog {
        this.logger = this.logger.child(bindings);
        return this;
    }

    close() {
    }

    protected getEmitter(level = bunyan.DEBUG) {
        const self = this;
        const levelName: string = bunyan.nameFromLevel[level];

        return function emit() {
            const entry: LogItem = self.parseLogArgs(Array.from(arguments));
            const {
                event, err, details, limitOutput, bindings,
            } = entry;

            self.logger[levelName]({err, details, limitOutput, ...bindings}, event);
            return self;
        };
    }

    protected getLogger(options: any): Logger {
        return bunyan.createLogger({
            ...{
                name: this.name,
                level: LogUtils.getSystemLogLevel(),
                serializers: {

                    ...(options.serializers || {}),
                },
                streams: options.streams || [{
                    stream: process.stdout,
                }],
            },
            ...(options.bindings || {}),
        });
    }

    protected parseLogArgs(args: any[]): LogItem {
        const result: LogItem = {event: '', level: ''};
        args.forEach((arg) => {
            if (_.isNumber(arg) || _.isString(arg)) {
                if (result.event) {
                    result.details = arg;
                } else {
                    result.event = arg;
                }
            }

            if (arg === true || arg === false) {
                result.limitOutput = arg;
            }

            if (_.isObject(arg)) {
                if (arg instanceof Error) {
                    result.err = arg;
                } else if (result.details) {
                    result.bindings = arg;
                } else {
                    result.details = arg;
                }
            }
        });
        return result;
    }

}

export {StructLog, StructuredLogger, LogEmitter, LogItem}
