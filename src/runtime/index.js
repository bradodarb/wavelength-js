/** @module wavelength */
const { EventEmitter } = require('events').EventEmitter;
const { Decay } = require('./middle-ware');
const { getStandardResponse, getStandardError } = require('../utils/aws-object-utils');
const {
  Base4xxException, Base5xxException,
} = require('../contrib/errors/aws/apig');
const {
  CancelExecutionError,
} = require('../errors');
const { HandlerState } = require('./handler-state');

/**
 * @class
 * Wraps a lambda function in a similar way as express or koa creates an app
 */
class Wavelength extends EventEmitter {
  /**
   *    * Ctor for a Wavelength instance
   * @param name {string} name of the app
   * @param outputFormatter{function} used for execution result formatting
   * @param errorFormatter {function} used for unhandled error formatting
   * @param logger {object} incoming logger instance
   */
  constructor(name, outputFormatter, errorFormatter, logger = console) {
    super();
    this.name = name;
    this.logger = logger;
    this.formatResult = outputFormatter;
    this.formatError = errorFormatter;
    this.middleWare = new Decay(this.complete.bind(this));
  }

  /**
   * Callable Style application runner
   * @param handlerFunction
   * @returns {function(*=, *=, *): Promise<*>}
   */
  handler(handlerFunction) {
    const handle = async (event, context, callback) => {
      this.logger.name = this.name;
      this.logger.context = context;
      this.callback = callback;
      this.state = new HandlerState(this.name, event, context, this.logger);
      return this.run(handlerFunction);
    };
    handle.bind(this);
    return handle;
  }

  /**
   * Runs the application handler after all the middleware has been registered
   * @param handler {function} handler function
   * @returns {Promise<*>} Because AWS lambda supports async.  Even legacy style
   * callback handlers will be transformed to return an awaitable
   */
  async run(handler) {
    this.middleWare.use(async (state) => {
      state.push({ response: await handler(this.state) });
    });
    try {
      this.emit('enter', this.state);
      this.onInvoke();
      await this.middleWare.invoke(this.state);
      this.emit('success', this.state);
    } catch (e) {
      this.handleError(e);
      this.emit('failure', this.state);
    }
    const result = this.closeLambda();
    this.logger.flush();
    this.emit('exit', this.state);
    return result;
  }

  /**
   * Global error handler to return an application error when possible
   * if the error that was trapped is not an application error, just emit a 500
   * @param error {Error}
   */
  handleError(error) {
    if (this.checkCancellationError(error)) {
      return;
    }
    if (this.checkApplicationError(error, Base4xxException)) {
      return;
    }
    if (this.checkApplicationError(error, Base5xxException)) {
      return;
    }
    this.state.push({
      error: { message: error.message, error: error.toString() },
    });
  }

  /**
   * Trace function to log result of lambda handler execution
   * @param err {Error}
   * @param state {HandlerState}
   */
  complete(err, state) {
    if (err) {
      this.logger.error({ event: 'Lambda Execution Failed', err });
      throw err;
    }
    this.logger.info({ event: 'Lambda Execution Success', bindings: { result: state.response } });
  }

  /**
   * Returns an awaitable based on the returned result of the handler or a callback result
   * @returns {Promise<*>}
   */
  async closeLambda() {
    let result;
    let err;
    if (this.state.error) {
      err = this.formatError(this.state);
    } else {
      result = this.formatResult(this.state);
    }
    this.onClose();
    if (this.callback) {
      this.callback(err, result);
    }
    return err || result;
  }

  /**
   * Trace function to log that a function has been executed
   */
  onInvoke() {
    this.logger.info({
      event: 'TRACE',
      bindings: {
        lambda_event: this.state.event,
        state: 'Invoked',
        context: this.state.context,
      },
    });
  }

  /**
   * trace function to log that function execution has completed
   * @param result {*} final result of the handler
   */
  onClose(result) {
    this.logger.info({
      event: 'TRACE',
      bindings: {
        state: 'Completed',
        returnValue: result,
      },
    });
    if (result) {
      this.logger.append({
        returnValue: result,
      });
    }
  }

  /**
   * Detects a cancellation error, which acts a token to request the execution lifecycle exit early
   * @param error
   * @returns {boolean}
   */
  checkCancellationError(error) {
    const result = error instanceof CancelExecutionError;
    if (result) {
      this.state.push({ response: error.getResponse() });
    }
    return result;
  }

  /**
   * Function to evaluate whether a trapped error is an application error or unhandled exception
   * @param error {Error} trapped error
   * @param type {object} type to check against
   * @returns {boolean} if the error is of expected type
   */
  checkApplicationError(error, type) {
    if (error instanceof type) {
      this.state.push({ error: error.getResponse(this.state.context) });
      return true;
    }
    return false;
  }
}


module.exports = { Wavelength };
