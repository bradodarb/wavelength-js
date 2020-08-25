import { ILogger } from "@logging/util";
interface IHandlerState<E extends Object, C extends Object> {
    name: string;
    event: E;
    context: C;
    logger: ILogger;
    [propName: string]: any;
    /**
     * Adds entries to state tree
     * @param value - should be an object literal that can be applied to this state object
     */
    push(value: Object): void;
    /**
     * Removes an entry from the state tree
     * @param value - Either a string to remove by key or an object to search for on state tree to remove
     */
    pop(value: string | Object): any;
}
declare class HandlerState<E, C> implements IHandlerState<E, C> {
    name: string;
    event: E;
    context: C;
    logger: ILogger;
    [propName: string]: any;
    constructor(name: string, event: E, context: C, logger: ILogger);
    push(value: Object): void;
    pop(value: string | Object): any;
}
export { IHandlerState, HandlerState };
