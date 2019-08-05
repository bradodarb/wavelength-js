/* eslint-disable prefer-rest-params */
/** @module legacy-logger */

const util = require('util');
const { EventEmitter } = require('events').EventEmitter;
const _ = require('lodash');
const bunyan = require('bunyan');
const StructLog = require('.');
const Metrics = require('./inoculators/metrics');
const { getStandardResponse } = require('../utils/aws-object-utils');
const pii = require('../utils/pii');
/**
 * @class
 * Facilitates converting standard console.log type arguments into structured
 * log output based on conventions described in the readme
 */
class LegacyLogger {
  /**
   * Ctor for legacy log helper
   * @param name {string} Logger name
   * @param event {object} incoming AWS lambda event object
   * @param context {object} incoming AWS lambda context object
   * @param filters {[function]} log event filters
   */
  constructor(name, event, context, filters = []) {
    this.event = event;
    this.context = context;
    this.logger = new StructLog(name, context, filters);
    this.logger.info({
      event: 'TRACE',
      bindings: {
        lambda_event: this.event,
        state: 'Invoked',
        context: this.context,
      },
    });

    this.log = this.getLegacyEmitter(bunyan.DEBUG);
    this.info = this.getLegacyEmitter(bunyan.INFO);
    this.warn = this.getLegacyEmitter(bunyan.WARN);
    this.error = this.getLegacyEmitter(bunyan.ERROR);

    this.isFlushed = false;
    this.logger.inoculate('metrics', new Metrics.MetricsInoculator());
  }

  /**
   * Helper functionn to build a logger at a given level
   * @param level {number} valid log level
   * @returns {function(): LegacyLogger}
   */
  getLegacyEmitter(level) {
    const levelName = bunyan.nameFromLevel[level];
    const self = this;
    const result = function emit() {
      const entry = LegacyLogger.buildLogEntry(Array.from(arguments));
      self.logger[levelName](entry);
      return self;
    };
    util.inherits(result, EventEmitter);
    return result;
  }

  /**
   *  Converts arguments array to a structured log entry
   * @param args {*}
   * @returns {object} An object suitable for creating a structured og event
   */
  static buildLogEntry(args) {
    const result = {};
    args.forEach((arg) => {
      if (_.isNumber(arg) || _.isString(arg)) {
        if (result.event) {
          result.details = arg;
        } else {
          result.event = arg;
        }
      }

      if (arg === true || arg === false) {
        result.limitOutput = arg;
      }

      if (_.isObject(arg)) {
        if (arg instanceof Error) {
          result.err = arg;
        } else if (result.details) {
          result.bindings = arg;
        } else {
          result.details = arg;
        }
      }
    });
    return result;
  }

  /**
   * Exposes the underlying logger's bind method to attach K/V pairs to subsequent log events
   * @param bindings
   */
  bind(bindings) {
    this.logger.bind(bindings);
  }

  /**
   * Logs the result of the handler execution and flushed the buffered logs to console.debug
   * @param result
   */
  flush(result) {
    if (!this.isFlushed) {
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
      this.logger.flush();
      this.isFlushed = true;
    }
  }
}

/**
 * Monkey patches the global console object so that it can emit structured logs
 * @param name {string} Logger name
 * @param event {object} incoming AWS lambda event object
 * @param context {object} incoming AWS lambda context object
 * @param filters {[function]} log event filters
 */
function patchConsole(name, event, context, filters = []) {
  const logger = new LegacyLogger(name, event, context, filters);
  console.bind = logger.bind.bind(logger);
  console.log = logger.log.bind(logger);
  console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);
  console.flush = logger.flush.bind(logger);
  console.metrics = logger.logger.metrics;
  console.append = logger.logger.append.bind(logger.logger);
}

module.exports.patchConsole = patchConsole;

/**
 * This is a decorator function to provide a level of service
 * quality compliance for legacy code bases
 * Enables standard log tracing and automatic buffer flushing
 * @param fn {function} legacy lambda handler
 * @param name {function}  handler name
 * @param filters {[function]} log event filters
 * @returns {function} wrapped (decorated) handler function with
 * log tracing and patched console logger built in
 */
module.exports.bootstrap = function bootstrap(fn, name, filters = []) {
  return async function wrapper(event, context, callback) {
    patchConsole(name, event, context, pii.defaultFilters(filters));
    if (event && event.source === 'serverless-plugin-warmup') {
      const warmupResult = getStandardResponse({ body: 'Skipping warm-up execution' });
      console.flush('Skipping warm-up execution');
      return warmupResult;
    }
    if (fn.length > 2) {
      return new Promise((resolve) => {
        fn(event, context, (err, val) => {
          const callbackResult = err || val;
          console.flush(callbackResult);
          callback(err, val);
          resolve(callbackResult);
        });
      });
    }
    const result = await fn(event, context);
    console.flush(result);
    return result;
  };
};
