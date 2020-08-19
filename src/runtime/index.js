/** @module wavelength */
const StructLog = require('../logging');
const Metrics = require('../logging/inoculators/metrics');
const { Decay } = require('./middle-ware');
const { getStandardResponse, getStandardError } = require('../utils/aws-object-utils');
const pii = require('../utils/pii');
const {
  Base4xxException, Base5xxException,
} = require('../contrib/errors/aws-apig');
const {
  CancelExecutionError, BaseException,
} = require('../errors');
const { HandlerState } = require('./handler-state');

/**
 * @class
 * Wraps a lambda function in a similar way as express or koa creates an app
 */
class Wavelength {
  /**
   * Ctor for a Wavelength instance
   * @param name {string} name of the app
   * @param event {object} incoming AWS lambda event object
   * @param context {object} incoming AWS lambda context object
   * @param filters {[function]} log event filters
   * @param callback {function} incoming AWS lambda callback (for legacy support ONLY)
   */
  constructor({
    name, event, context, callback = undefined, filters = [],
  } = {}) {
    this.name = name;
    this.callback = callback;
    this.logger = new StructLog(name, context, pii.defaultFilters(filters));
    this.middleWare = new Decay(this.complete.bind(this));
    this.state = new HandlerState(name, event, context, this.logger);

    this.logger.inoculate('metrics', new Metrics.MetricsInoculator());
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
      this.onInvoke();
      await this.middleWare.invoke(this.state);
    } catch (e) {
      this.handleError(e);
    }
    const result = this.closeLambda();
    this.logger.flush();
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
      error: getStandardError({ message: 'Unexpected Server Error', status: 500, reason: error.message }),
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
      err = this.state.error;
    } else {
      const { status, response: body } = this.state;
      result = getStandardResponse({ status, body });
    }
    this.onClose();
    if (this.callback) {
      this.callback(err, result);
    }
    return err || result;
  }

  /**
   * Trace function to log that a lambda has been executed
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
   * race function to log that lambda execution has completed
   * @param result {*} final result of the handler
   */
  onClose(result) {
    this.logger.info({
      event: 'TRACE',
      bindings: {
        state: 'Completed',
        return_result: result,
      },
    });
    if (result) {
      this.logger.append({
        return_status: result,
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
      this.state.push({ status: 444, response: { cancelled: true } });
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
