import * as _ from 'lodash';
import {HandlerState} from "../runtime";

interface MiddleWareTerminalFunction {
    (error?: Error): void | never;

}


interface MiddleWareFunction<E = any, C = any> {
    (state: HandlerState<E, C>): void | Error | Promise<void | Error>;
}

interface MiddleWareInvoker<E = any, C = any> {
    invoke: MiddleWareFunction<E, C>;
    next: MiddleWareInvoker<E, C> | null;
}

interface MiddleWareFactory<E = any, C = any> {
    (): MiddleWareFunction<E, C>
}

interface MiddleWareProvider<E = any, C = any> {
    middleWare: MiddleWareFactory<E, C>
}

type MiddleWareSource<E = any, C = any> = MiddleWareProvider | MiddleWareFactory | MiddleWareFunction;

function isMiddleWareProvider<E, C>(source: any): source is MiddleWareProvider<E, C> {
    return source && _.isFunction(source.middleWare) && source.middleWare.length === 0;
}

function isMiddleWareFactory<E, C>(source: any): source is MiddleWareFactory<E, C> {
    return _.isFunction(source) && source.length === 0;
}

function isMiddleWareFunction<E, C>(source: any): source is MiddleWareFunction<E, C> {
    return _.isFunction(source) && source.length === 1;
}

function resolveMiddleWareSource<E, C>(source: MiddleWareSource): MiddleWareFunction<E, C> | null {
    if (isMiddleWareFunction<E, C>(source)) {
        return source;
    }
    if (isMiddleWareFactory<E, C>(source)) {
        return source();
    }
    if (isMiddleWareProvider<E, C>(source)) {
        return source.middleWare();
    }
    return null
}

class MiddleWare<E, C> {
    wares: MiddleWareInvoker<E, C>[];
    complete: MiddleWareTerminalFunction;

    constructor(terminalFunction: MiddleWareTerminalFunction) {
        this.complete = terminalFunction;
        this.wares = [];
    }

    use(ware: MiddleWareSource<E, C> | MiddleWareSource<E, C>[]): MiddleWare<E, C> {
        let wares = [];
        if (Array.isArray(ware)) {
            wares = ware.map(source => resolveMiddleWareSource(source));
        } else {
            wares.push(resolveMiddleWareSource(ware));
        }

        wares.forEach((wareFunc) => {
            if (wareFunc) {
                const previousWare = this.wares[this.wares.length - 1];
                const currentWare = {
                    invoke: wareFunc,
                    next: null,
                };
                if (previousWare) {
                    previousWare.next = currentWare;
                }
                this.wares.push(currentWare);
            }
        });

        return this;
    }

    async invoke(state: HandlerState<E, C>) {
        if (!this.wares.length) {
            this.complete();
            return;
        }

        let ware: MiddleWareInvoker<E, C> | null = this.wares[0];
        while (ware) {
            const error = await ware.invoke(state);
            if (error) {
                this.complete(error);
                return;
            }
            ware = ware.next
        }
        this.complete();
    }
}

export {
    MiddleWare,
    MiddleWareFunction,
    MiddleWareInvoker,
    MiddleWareTerminalFunction,
    MiddleWareFactory,
    MiddleWareProvider,
    MiddleWareSource
}
