import {isString} from 'lodash';
import {ILogger} from "@logging/util";

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

class HandlerState<E, C> implements IHandlerState<E, C> {
    name: string;
    event: E;
    context: C;
    logger: ILogger;

    [propName: string]: any;

    constructor(name: string, event: E, context: C, logger: ILogger) {
        this.name = name;
        this.event = event;
        this.context = context;
        this.logger = logger;

    }

    push(value: Object) {
        Object.assign(this, value);
    }

    pop(value: string | Object) {
        let result = null;

        if (isString(value)) {
            result = this[value];
            delete this[value];
        } else {
            Object.keys(this).forEach((key) => {
                if (this[key] === value) {
                    result = this[key];
                    delete this[key];
                }
            });
        }
        return result;
    }
}


export {IHandlerState, HandlerState}
