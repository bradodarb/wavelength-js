import {EventEmitter} from 'events';

import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import stringify from 'fast-safe-stringify';
import {StructLog} from "./logger";
import {LOG_LEVEL_MAP, LogItem, LogItemCollection, LogItemFilter, REVERSED_LOG_LEVEL_MAP} from "./util";
import {Serializable} from "../util";

interface Inoculation {
    result: Serializable
}


class BufferedLogStream extends EventEmitter {
    records: LogItem[];
    limit: number;
    writable: boolean;
    filters?: LogItemFilter[];
    additionalItems: Object[];
    inoculations: Inoculation[];
    outputCall: Function;

    constructor(limit: number = 100, filters: LogItemFilter[] = []) {
        super();
        this.limit = limit;
        this.writable = true;
        this.records = [];
        this.filters = filters;
        this.additionalItems = [];
        this.inoculations = [];
        if (process.env.USE_CONSOLE_LOGGER) {
            this.outputCall = console.debug.bind(console);
        }else{
            this.outputCall = process.stdout.write.bind(process.stdout);
        }
    }


    write(record: LogItem) {
        if (!this.writable) {
            throw (new Error('BufferedStream has been ended already'));
        }
        const logRecord = this.sanitize(record);


        if (REVERSED_LOG_LEVEL_MAP[logRecord.level] > bunyan.WARN) {
            this.dump(logRecord);
        }
        this.records.push(logRecord);


        if (this.records.length >= this.limit) {
            this.drain();
        }

        return this;
    }

    drain() {
        let record = {
            items: this.records,
        };

        this.additionalItems.forEach((item) => {
            record = Object.assign(record, item);
        });

        this.dump(record);
        this.records = [];
    }


    sanitize(record: LogItem): LogItem {
        const recordCopy = JSON.parse(this.serialize(record));
        if (recordCopy.msg) {
            recordCopy.event = recordCopy.msg;
            delete recordCopy.msg;
        }
        let logRecord = Object.assign({}, recordCopy, this.getRecordDefaults(recordCopy));
        if (this.filters) {
            try {
                this.filters.forEach((filter) => {
                    if (_.isFunction(filter)) {
                        logRecord = filter(logRecord);
                    }
                });
            } catch (e) {
                logRecord = Object.assign({}, recordCopy, this.getRecordDefaults(recordCopy));
            }
        }
        return logRecord;
    }

    /**
     * Adds a top-level item to the buffered log output
     * @param item {(object||array)}
     */
    add(item: Object): void {
        if (!_.isObject(item)) {
            return;
        }
        this.additionalItems.push(item);
    }

    inoculate(item: Inoculation): void {
        if (!_.isObject(item)) {
            return;
        }
        this.inoculations.push(item);

    }

    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    end(): void {
        this.writable = false;
    }

    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    destroy(): void {
        this.writable = false;
        this.emit('close');
    }

    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    destroySoon(): void {
        this.destroy();
    }

    /**
     * Appends the standard log K/V pairs required for every log event
     * @param record {object} original log event
     * @returns {{level: string, event: string, interim_desc: string, name: undefined}}
     */
    protected getRecordDefaults(record: LogItem) {
        const {maxLength: max} = record;
        return {
            level: LOG_LEVEL_MAP[record.level],
            event: this.truncate(<string>record.event, max),
            details: this.truncate(<string>record.details, max),
            name: undefined,
        };
    }

    protected truncate(field: string, max: number): string {
        if (max && _.isString(field) && field.length > max) {
            return `TRUNCATED:${field.substring(0, max)}`;
        }
        if ((_.isObject(field) || _.isArray(field))) {
            const check = stringify(field);
            if (check.length > max) {
                return `TRUNCATED:${check.substring(0, max)}`;
            }
        }
        return field;
    }

    protected serialize(source: LogItem | LogItemCollection): string {
        const originalBufferToJSON = Buffer.prototype.toJSON;
        Buffer.prototype.toJSON = () => {
            return {
                type: 'Buffer',
                data: []
            }
        };

        const result = stringify(source);
        Buffer.prototype.toJSON = originalBufferToJSON;

        return result;
    }

    /**
     * Write log event to process.stdout
     * Sending everything to console.debug to avoid Lambda runtime monkey-patching
     *  https://forums.aws.amazon.com/thread.jspa?messageID=739180
     * @param record {*}
     */
    protected dump(record: LogItem | LogItemCollection): void {
        try {
            this.inoculations.forEach((item) => {
                record = Object.assign(record, item.result);
            });
            this.outputCall(this.serialize(record));
        } catch (e) {
            // /Swallow errors ...
        }
    }
}

export default class BufferedLogger extends StructLog {
    buffer: BufferedLogStream;

    constructor(name: string, options: any = {}) {
        const buffer = new BufferedLogStream(
            parseInt(process.env.LOG_BUFFER_SIZE || '100', 10)
            , options.filters)
        super(name, Object.assign({}, options, {
            streams: [
                {
                    type: 'raw',
                    stream: buffer
                }
            ]
        }));
        this.buffer = buffer;
        this.buffer.inoculate(this.metrics);
    }

    append(item: object): void {
        this.buffer.add(item);
    }

    close(): void {
        if (this.buffer) {
            this.buffer.drain();
        }
    }
}
