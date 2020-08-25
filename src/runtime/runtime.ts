import {EventEmitter} from 'events';
import {ILogger} from "@logging/util";
import {HandlerState, IHandlerState} from "@runtime/handler-state";
import {MiddleWare} from "@src/middleware";
import {BaseException, CancelExecutionError} from "@errors/base";
import {ICallback} from "@util/type-utils";




interface IHandler<E, C> {
    (event: E, context: C, callback?: ICallback): any
}

interface IRuntimeHandler<E, C> {
    (state: HandlerState<E, C>): any
}

interface IResult<E, C, R> {
    (state: HandlerState<E, C>): R
}


class Runtime<E, C, S, F> extends EventEmitter {
    name: string;
    state: HandlerState<E, C>;
    middleWare: MiddleWare<E, C>;
    callback?: ICallback;
    logger: ILogger;
    success: IResult<E, C, S>;
    fail: IResult<E, C, F>;

    constructor(name: string, logger: ILogger, successTransform: IResult<E, C, S>, failedTransform: IResult<E, C, F>) {
        super();
        this.name = name;
        this.logger = logger;
        this.success = successTransform;
        this.fail = failedTransform;
        this.middleWare = new MiddleWare<E, C>(this.complete.bind(this));
        this.state = new HandlerState<E, C>(this.name, {} as E, {} as C, this.logger);
    }

    handler(handler: IRuntimeHandler<E, C>): IHandler<E, C> {
        const self = this;

        async function handle(event: E, context: C, callback?: ICallback): Promise<S | F | undefined> {
            self.state = new HandlerState<E, C>(self.name, event, context, self.logger);

            self.callback = callback;
            return self.run(handler)
        }

        handle.bind(this);
        return handle;
    }

    async run(handler: IRuntimeHandler<E, C>): Promise<S | F | undefined> {
        this.middleWare.use(async (state: IHandlerState<E, C>) => {
            state.push({response: await handler(this.state)});
        });
        try {
            this.emit('enter', this.state);
            await this.middleWare.invoke(this.state);
            this.emit('success', this.state);
        } catch (e) {
            this.handleError(e);
            this.emit('failure', this.state);
        }
        const result = this.closeLambda();
        this.logger.close();
        this.emit('exit', this.state);
        return result;
    }

    handleError(error: Error) {
        if (this.checkCancellationError(error)) {
            return;
        }
        if (this.checkApplicationError(error)) {
            return;
        }
        this.state.push({
            error: {message: error.message, error: error.toString()},
        });
    }

    complete(err?: Error) {
        if (err) {
            throw err;
        }
    }


    closeLambda(): S | F | undefined {
        let result;
        let err;
        if (this.state.error) {
            err = this.fail(this.state);
        } else {
            result = this.success(this.state);
        }
        if (this.callback) {
            this.callback(err, result);
        }
        return err || result;
    }





    checkCancellationError(error: Error) {
        if (error instanceof CancelExecutionError) {
            this.state.push({response: error.getResponse()});
            return true
        }
        return false;
    }


    checkApplicationError(error: Error) {
        if (error instanceof BaseException) {
            this.state.push({error: error.getResponse()});
            return true;
        }
        return false;
    }
}


export {Runtime, IResult, IRuntimeHandler, IHandler, ICallback};
