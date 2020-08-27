import {EventEmitter} from 'events';
import {StructuredLogger} from "../logging";
import {HANDLER_STATUS, HandlerState, State} from "./state";
import {MiddleWare} from "../middleware";
import {BaseException, CancelExecutionError} from "../errors";
import {Callback, Serializable} from "../util";


interface Handler<E, C> {
    (event: E, context: C): any
}

interface CallbackHandler<E, C> {
    (event: E, context: C, callback?: Callback): any
}

interface RuntimeHandler<E, C> {
    (state: State<E, C>): any
}

interface Result<E, C, R = Serializable> {
    (state: State<E, C>): R
}

function passThroughTransform<E, C, R = Serializable>(state: State<E, C>): R {
    return state.value as R;
}

class Runtime<E, C, S = Serializable, F = Serializable> extends EventEmitter {
    name: string;
    state: State<E, C>;
    middleWare: MiddleWare<E, C>;
    logger: StructuredLogger;
    success: Result<E, C, S>;
    fail: Result<E, C, F>;

    constructor(name: string, logger: StructuredLogger, successTransform?: Result<E, C, S>, failedTransform?: Result<E, C, F>) {
        super();
        this.name = name;
        this.logger = logger;
        this.success = successTransform || passThroughTransform;
        this.fail = failedTransform || passThroughTransform;
        this.middleWare = new MiddleWare<E, C>(this.complete.bind(this));
        this.state = new State<E, C>(this.name, {} as E, {} as C, this.logger);
    }

    handler(handler: RuntimeHandler<E, C>): Handler<E, C> {
        const self = this;

        async function handle(event: E, context: C): Promise<S | F | undefined> {
            self.state = new State<E, C>(self.name, event, context, self.logger);
            return self.run(handler)
        }

        handle.bind(this);
        return handle;
    }

    async run(handler: RuntimeHandler<E, C>): Promise<S | F | undefined> {
        this.middleWare.use(async (state: HandlerState<E, C>) => {
            state.value = await handler(this.state);
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
        this.emit('exit', this.state);
        this.logger.close();
        return result;
    }

    handleError(error: Error) {
        if (this.checkCancellationError(error)) {
            return;
        }
        if (this.checkApplicationError(error)) {
            return;
        }
        this.state.error = {message: error.message, error: error.toString()};

    }

    complete(err?: Error) {
        if (err) {
            throw err;
        }
    }

    closeLambda(): S | F | undefined {
        if (this.state.status === HANDLER_STATUS.FAILURE) {
            return this.fail(this.state);
        } else {
            return this.success(this.state);
        }
    }

    checkCancellationError(error: Error) {
        if (error instanceof CancelExecutionError) {
            this.state.value = {error: error.getResponse()};
            return true
        }
        return false;
    }

    checkApplicationError(error: Error) {
        if (error instanceof BaseException) {
            this.state.error = {error: error.getResponse()};
            return true;
        }
        return false;
    }
}


export {Runtime, Result, RuntimeHandler, Handler, CallbackHandler};
