/// <reference types="node" />
import { EventEmitter } from 'events';
import { StructLog } from "@logging/logger";
import { ILogItem, ILogItemCollection, ILogItemFilter } from "@logging/util";
declare class BufferedLogStream extends EventEmitter {
    records: ILogItem[];
    limit: number;
    writable: boolean;
    filters?: ILogItemFilter[];
    additionalItems: Object[];
    buffer: boolean;
    constructor(limit?: number, filters?: ILogItemFilter[]);
    write(record: ILogItem): this;
    drain(): void;
    sanitize(record: ILogItem): ILogItem;
    /**
     * Adds a top-level item to the buffered log output
     * @param item {(object||array)}
     */
    add(item: Object): void;
    /**
     * Appends the standard log K/V pairs required for every log event
     * @param record {object} original log event
     * @returns {{level: string, event: string, interim_desc: string, name: undefined}}
     */
    protected getRecordDefaults(record: ILogItem): {
        level: string;
        event: string;
        details: string;
        name: undefined;
    };
    protected truncate(field: string, max: number): string;
    protected serialize(source: ILogItem | ILogItemCollection): string;
    /**
     * Write log event to process.stdout
     * Sending everything to console.debug to avoid Lambda runtime monkey-patching
     *  https://forums.aws.amazon.com/thread.jspa?messageID=739180
     * @param record {*}
     */
    protected dump(record: ILogItem | ILogItemCollection): void;
    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    end(): void;
    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    destroy(): void;
    /**
     * Stream interface support
     * see: https://nodejs.org/api/stream.html
     */
    destroySoon(): void;
}
export default class BufferedLogger extends StructLog {
    buffer: BufferedLogStream;
    constructor(name: string, options?: any);
    append(item: object): void;
    close(): void;
}
export {};
