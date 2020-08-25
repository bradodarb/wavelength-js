import {ILogItem} from "@logging/util";
import {IHandlerState} from "@runtime/handler-state";

interface IMiddleWareTerminalFunction{
    (error?: Error): void | never;

}


interface IMiddleWareFunction<E, C> {
    (state: IHandlerState<E, C>): void | Error | Promise<void | Error>;
}

interface IMiddleWare<E, C> {
    invoke: IMiddleWareFunction<E, C>;
    next: IMiddleWare<E, C> | null;
}

class MiddleWare<E, C> {
    wares: IMiddleWare<E, C>[];
    complete: IMiddleWareTerminalFunction;

    constructor(terminalFunction: IMiddleWareTerminalFunction) {
        this.complete = terminalFunction;
        this.wares = [];
    }


    use(ware: IMiddleWareFunction<E, C>): MiddleWare<E, C> {
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

    async invoke(state: IHandlerState<E, C>) {
        if (!this.wares.length) {
            this.complete();
            return;
        }

        let ware: IMiddleWare<E, C>| null = this.wares[0];
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

export {MiddleWare, IMiddleWareFunction, IMiddleWare, IMiddleWareTerminalFunction}
