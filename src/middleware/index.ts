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

class MiddleWare<E, C> {
    wares: MiddleWareInvoker<E, C>[];
    complete: MiddleWareTerminalFunction;

    constructor(terminalFunction: MiddleWareTerminalFunction) {
        this.complete = terminalFunction;
        this.wares = [];
    }


    use(ware: MiddleWareFunction<E, C> | MiddleWareFunction<E, C>[]): MiddleWare<E, C> {
        let wares = [];
        if (Array.isArray(ware)) {
            wares = ware;
        } else {
            wares.push(ware);
        }

        wares.forEach((wareFunc) => {
            const previousWare = this.wares[this.wares.length - 1];
            const currentWare = {
                invoke: wareFunc,
                next: null,
            };
            if (previousWare) {
                previousWare.next = currentWare;
            }
            this.wares.push(currentWare);
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

export {MiddleWare, MiddleWareFunction, MiddleWareInvoker, MiddleWareTerminalFunction}
