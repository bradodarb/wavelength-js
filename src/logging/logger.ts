import * as bunyan from 'bunyan';
import Logger from 'bunyan';
import * as _ from 'lodash';
import {LogEmitter, LogItem, LogUtils, MetricCollector, StructuredLogger} from './util';
import {Metrics} from "./metrics";
import {Indexed, Serializable} from '../util';

class FluentLoggerWrapper implements StructuredLogger {
    innerLogger: StructuredLogger & Indexed;
    name: string;
    event: Serializable;
    details?: Serializable;
    err?: Serializable;
    bindings?: Serializable;
    metrics: MetricCollector;

    constructor(innerLogger: StructuredLogger,
                event: Serializable,
                details: Serializable,
                err: Serializable,
                bindings: Serializable
    ) {
        this.innerLogger = innerLogger;
        this.name = innerLogger.name;
        this.metrics = innerLogger.metrics;
        this.event = event;
        this.details = details;
        this.err = err;
        this.bindings = bindings;
    }

    trace(event: Serializable): StructuredLogger {
        this.emit(event, 'trace');
        return this;
    }
    debug(event: Serializable): StructuredLogger {
        this.emit(event, 'debug');
        return this;
    }

    info(event: Serializable): StructuredLogger {
        this.emit(event, 'info');
        return this;
    }

    warn(event: Serializable): StructuredLogger {
        this.emit(event, 'warn');
        return this;
    }

    error(event: Serializable): StructuredLogger {
        this.emit(event, 'error');
        return this;
    }

    critical(event: Serializable): StructuredLogger {
        this.emit(event, 'critical');
        return this;
    }

    bind(bindings: object): StructuredLogger {
        this.innerLogger.bind(bindings);
        return this;
    }

    close() {
        this.innerLogger.close();
    }

    private emit(event: Serializable, level: string): StructuredLogger {
        if (_.isObject(event)) {
            this.innerLogger[level](this.event,
                this.details,
                this.err,
                Object.assign({}, this.bindings, event));
            return this;
        }
        this.innerLogger[level](event);
        return this;
    }
}

class StructLog implements StructuredLogger {
    name: string;
    trace: LogEmitter;
    debug: LogEmitter;
    info: LogEmitter;
    warn: LogEmitter;
    error: LogEmitter;
    critical: LogEmitter;
    metrics: MetricCollector
    logger: Logger & Indexed;

    constructor(name: string, options: any = {}) {
        this.name = name;
        this.trace = this.getEmitter(bunyan.TRACE);
        this.debug = this.getEmitter(bunyan.DEBUG);
        this.info = this.getEmitter(bunyan.INFO);
        this.warn = this.getEmitter(bunyan.WARN);
        this.error = this.getEmitter(bunyan.ERROR);
        this.critical = this.getEmitter(bunyan.FATAL);
        this.logger = this.getLogger(options);
        this.metrics = new Metrics();
    }

    bind(bindings: object): StructLog {
        this.logger = this.logger.child(bindings);
        return this;
    }

    close() {
        this.logger.info('Metrics', {details: this.metrics.result});
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
            return new FluentLoggerWrapper(self, event, details, err, bindings);
        };
    }

    protected getLogger(options: any): Logger {
        return bunyan.createLogger({
            ...{
                name: this.name,
                level: LogUtils.getSystemLogLevel(),
                serializers: {
                    ... bunyan.stdSerializers,
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

            if (_.isBoolean(arg)) {
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
