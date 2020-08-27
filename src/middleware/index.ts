import * as _ from 'lodash';
import {HandlerState} from "../runtime";

interface MiddleWareTerminalFunction {
    (error?: Error): void | never;

}


interface MiddleWareFunction<E, C> {
    (state: HandlerState<E, C>): void | Error | Promise<void | Error>;
}

interface MiddleWareInvoker<E, C> {
    invoke: MiddleWareFunction<E, C>;
    next: MiddleWareInvoker<E, C> | null;
}

interface MiddleWareFactory<E, C> {
    (): MiddleWareFunction<E, C>
}

interface MiddleWareProvider<E, C> {
    middleWare: MiddleWareFactory<E, C>
}

type MiddleWareSource<E, C> = MiddleWareProvider<E, C> | MiddleWareFactory<E, C> | MiddleWareFunction<E, C>;

function isMiddleWareProvider<E, C>(source: any): source is MiddleWareProvider<E, C> {
    return source && _.isFunction(source.middleWare) && source.middleWare.length === 0;
}

function isMiddleWareFactory<E, C>(source: any): source is MiddleWareFactory<E, C> {
    return _.isFunction(source) && source.length === 0;
}

function isMiddleWareFunction<E, C>(source: any): source is MiddleWareFunction<E, C> {
    return _.isFunction(source) && source.length === 1;
}

function resolveMiddleWareSource<E, C>(source: MiddleWareSource<E, C>): MiddleWareFunction<E, C> | null {
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

export {MiddleWare, MiddleWareFunction, MiddleWareInvoker, MiddleWareTerminalFunction, MiddleWareFactory, MiddleWareProvider}
