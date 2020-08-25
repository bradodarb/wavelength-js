import Logger from "bunyan";
import { ILogger, ILogEmitter, ILogItem } from '@logging/util';
import { IIndexed } from '@util/type-utils';
declare class StructLog implements ILogger {
    name: string;
    debug: ILogEmitter;
    info: ILogEmitter;
    warn: ILogEmitter;
    error: ILogEmitter;
    critical: ILogEmitter;
    logger: Logger & IIndexed;
    constructor(name: string, options?: any);
    bind(bindings: object): StructLog;
    close(): void;
    protected getEmitter(level?: number): () => this;
    protected getLogger(options: any): Logger;
    protected parseLogArgs(args: any[]): ILogItem;
}
export { StructLog, ILogger, ILogEmitter, ILogItem };
