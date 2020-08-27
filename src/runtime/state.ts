import * as _ from 'lodash';
import {StructuredLogger} from "../logging";
import {Serializable} from "../util";

enum HANDLER_STATUS {
    INIT = 'INIT',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

interface HandlerState<E = any, C = any> {
    name: string;
    event: E;
    context: C;
    logger: StructuredLogger;
    status: HANDLER_STATUS;
    value: Serializable;

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

class State<E, C> implements HandlerState<E, C> {
    name: string;
    event: E;
    context: C;
    logger: StructuredLogger;

    constructor(name: string, event: E, context: C, logger: StructuredLogger) {
        this.name = name;
        this.event = event;
        this.context = context;
        this.logger = logger;
        this._status = HANDLER_STATUS.INIT;

    }

    [propName: string]: any;

    _status: HANDLER_STATUS;

    get status(): HANDLER_STATUS {
        return this._status
    }

    _value: Serializable;

    get value(): Serializable {
        return this._value;
    }

    set value(value: Serializable) {
        this.finalize(value, HANDLER_STATUS.SUCCESS);
    }

    set error(value: Serializable) {
        this.finalize(value, HANDLER_STATUS.FAILURE);
    }

    push(value: Object) {
        if (!value) {
            return;
        }
        const accessViolation = Object.keys(value).some(key => {
            return this.hasOwnProperty(key);
        });
        if (accessViolation) {
            throw new Error('Unable to override HandlerState member')
        }
        Object.assign(this, value);
    }

    pop(value: string | Object) {
        let result = null;

        if (_.isString(value)) {
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

    protected finalize(value: Serializable, status: HANDLER_STATUS) {
        if (this._status === HANDLER_STATUS.INIT) {
            this._status = status;
            this._value = value;
            Object.freeze(this);
        }
    }
}


export {HandlerState, State, HANDLER_STATUS}
