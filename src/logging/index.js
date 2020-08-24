/** @module slog */
const _ = require('lodash');
const bunyan = require('bunyan');
const serializers = require('./serializers');
const { BufferedLogStream } = require('./buffered-stream');
const { LogUtils } = require('./logging-utils');

/**
 * @class
 * Common structured logging interface
 */
class StructLog {
  /**
   * Ctor for Structured Logging class instance
   * @param name {string} Logger name used to override context.functionName
   * @param stream {EventEmitter} incoming context object
   * @param options {object}
   */
  constructor(
    name = 'Application',
    stream = new BufferedLogStream(100, []),
    options = {},
  ) {
    this.name = name;
    this.stream = stream;
    this.logger = this.getStructuredLogger({});
    this.debug = this.getEmitter(bunyan.DEBUG);
    this.info = this.getEmitter(bunyan.INFO);
    this.warn = this.getEmitter(bunyan.WARN);
    this.error = this.getEmitter(bunyan.ERROR);
    this.critical = this.getEmitter(bunyan.FATAL);
    this.maxMessageLength = LogUtils.getMaxLogLength();
    this.inoculations = [];
    this.options = options;
  }

  // TODO Remove this after handler is the default runtime interface
  /**
   * Updates this logger's context bindings
   * @param context {object} incoming AWS lambda context object
   */
  set context(context) {
    this.logger = this.getStructuredLogger(this.getLoggerOverrides(context || {}));
  }
  /**
   * Helper function to build a log emitter at a given level
   * @param level
   * @returns {function():  {StructLog}
   */
  getEmitter(level = bunyan.DEBUG) {
    const self = this;
    const levelName = bunyan.nameFromLevel[level];
    return function emit() {
      /* eslint-disable prefer-rest-params */
      const entry = StructLog.parseLogArgs(Array.from(arguments));
      const {
        event, err, details, limitOutput, bindings,
      } = entry;
      const record = self.buildLogRecord({
        err, details, limitOutput, bindings,
      });
      self.logger[levelName](record, event);
      return self;
    };
  }

  /**
     * Bind new key/values to this logger
     * @param bindings: object
     */
  bind(bindings) {
    this.logger = this.logger.child(bindings);
  }

  /**
   * Flushes the buffered stream
   */
  flush() {
    if (this.stream) {
      const self = this;
      try {
        this.inoculations.forEach((item) => {
          self.append(item.result);
        });
      } catch (e) {
        console.warn(e);
      }

      this.stream.drain();
    }
  }
  /**
   * Allows sub classed loggers to override underlying
   * logger options
   * @returns { {} | null}
   */
  /**
   * Allows sub classed loggers to override underlying
   * logger options
   * @param options {object}
   * @returns {object}
   */
  getLoggerOverrides(options = {}) {
    return { ...options };
  }
  /**
   * Builds a bunyan structured logger and binds the common fields we're interested
   * @param options
   * @returns {Logger}
   */
  getStructuredLogger(options = {
    bindings: {},
    serializers: {},
    streams: [],
  }) {
    return bunyan.createLogger({
      ...{
        name: this.name,
        level: LogUtils.getSystemLogLevel(),
        serializers: {
          ...{
            err: serializers.error,
            error: serializers.error,
            context: serializers.context,
          },
          ...(options.serializers || {}),
        },
        streams: [
          ...[
            {
              type: 'raw',
              stream: this.stream,
            },
          ], ...(options.streams || []),
        ],
      },
      ...(options.bindings || {}),
    });
  }


  /**
   *  Converts arguments array to a structured log entry
   * @param args {*}
   * @returns {object} An object suitable for creating a structured log event
   */
  static parseLogArgs(args) {
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
     * Build object for logger payload
     * @param err: Exception
     * @param details: string
     * @param limitOutput: bool
     * @param bindings: object
     */
  buildLogRecord({
    err, details, limitOutput = true, bindings = {},
  } = {}) {
    const record = {
      err,
      details,
      ...bindings,
    };
    if (limitOutput) {
      record.maxLogLength = this.maxMessageLength;
    }

    return record;
  }

  /**
   * Appends additional items to the buffered output
   * @param item {(object | array)}
   * @returns {StructLog}
   */
  append(item) {
    this.stream.add(item);
    return this;
  }

  /**
   * Adds an inoculation class to this logger for appending to the log output
   * @param key
   * @param inoculator {InoculatorBase}
   * @returns {StructLog}
   */
  inoculate(key, inoculator) {
    Object.assign(this, { [key]: inoculator });
    this.inoculations.push(inoculator);
    return this;
  }
}


export default{ StructLog };
