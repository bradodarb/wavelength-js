import { IHandlerState } from "@runtime/handler-state";
interface IMiddleWareTerminalFunction {
    (error?: Error): void | never;
}
interface IMiddleWareFunction<E, C> {
    (state: IHandlerState<E, C>): void | Error | Promise<void | Error>;
}
interface IMiddleWare<E, C> {
    invoke: IMiddleWareFunction<E, C>;
    next: IMiddleWare<E, C> | null;
}
declare class MiddleWare<E, C> {
    wares: IMiddleWare<E, C>[];
    complete: IMiddleWareTerminalFunction;
    constructor(terminalFunction: IMiddleWareTerminalFunction);
    use(ware: IMiddleWareFunction<E, C>): MiddleWare<E, C>;
    invoke(state: IHandlerState<E, C>): Promise<void>;
}
export { MiddleWare, IMiddleWareFunction, IMiddleWare, IMiddleWareTerminalFunction };
