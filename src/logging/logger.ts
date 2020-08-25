import Logger from "bunyan";
import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import {ILogger, LogUtils, ILogEmitter, ILogItem} from '@logging/util';
import {IIndexed} from '@util/type-utils';


class StructLog implements ILogger {
    name: string;
    debug: ILogEmitter;
    info: ILogEmitter;
    warn: ILogEmitter;
    error: ILogEmitter;
    critical: ILogEmitter;

    logger: Logger & IIndexed;

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
            const entry: ILogItem = self.parseLogArgs(Array.from(arguments));
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
                    type: 'raw',
                    stream: process.stdout,
                }],
            },
            ...(options.bindings || {}),
        });
    }

    protected parseLogArgs(args: any[]): ILogItem {
        const result: ILogItem = {event: '', level: ''};
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

export {StructLog, ILogger, ILogEmitter, ILogItem}
