/// <reference types="node" />
import { EventEmitter } from 'events';
import { ILogger } from "@logging/util";
import { HandlerState } from "@runtime/handler-state";
import { MiddleWare } from "@src/middleware";
import { ICallback } from "@util/type-utils";
interface IHandler<E, C> {
    (event: E, context: C, callback?: ICallback): any;
}
interface IRuntimeHandler<E, C> {
    (state: HandlerState<E, C>): any;
}
interface IResult<E, C, R> {
    (state: HandlerState<E, C>): R;
}
declare class Runtime<E, C, S, F> extends EventEmitter {
    name: string;
    state: HandlerState<E, C>;
    middleWare: MiddleWare<E, C>;
    callback?: ICallback;
    logger: ILogger;
    success: IResult<E, C, S>;
    fail: IResult<E, C, F>;
    constructor(name: string, logger: ILogger, successTransform: IResult<E, C, S>, failedTransform: IResult<E, C, F>);
    handler(handler: IRuntimeHandler<E, C>): IHandler<E, C>;
    run(handler: IRuntimeHandler<E, C>): Promise<S | F | undefined>;
    handleError(error: Error): void;
    complete(err?: Error): void;
    closeLambda(): S | F | undefined;
    checkCancellationError(error: Error): boolean;
    checkApplicationError(error: Error): boolean;
}
export { Runtime, IResult, IRuntimeHandler, IHandler, ICallback };
