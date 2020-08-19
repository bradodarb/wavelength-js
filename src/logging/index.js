/** @module slog */
const bunyan = require('bunyan');
const serializers = require('./serializers');
const BufferedLogStream = require('./buffered-stream');
const LogUtils = require('./logging-utils');

/**
 * @class
 * Common structured logging interface
 */
class StructLog {
  /**
   * Ctor for Structured Logging class instance
   * @param name {string} Logger name used to override context.functionName
   * @param context {object} incoming AWS lambda context object
   * @param filters {[function]} log event filters
   */
  constructor(name, context, filters = []) {
    this.name = name || context.functionName;
    this.stream = new BufferedLogStream(100, filters);
    this.logger = this.getStructuredLogger(context);
    this.debug = this.getEmitter(bunyan.DEBUG);
    this.info = this.getEmitter(bunyan.INFO);
    this.warn = this.getEmitter(bunyan.WARN);
    this.error = this.getEmitter(bunyan.ERROR);
    this.critical = this.getEmitter(bunyan.FATAL);
    this.maxMessageLength = LogUtils.getMaxLogLength();
    this.inoculations = [];
  }

  /**
   * Updates this logger's context bindings
   * @param context {object} incoming AWS lambda context object
   */
  set context(context) {
    this.logger = this.getStructuredLogger(context);
  }
  /**
   * Helper function to build a log emitter at a given level
   * @param level
   * @returns {function(): log}
   */
  getEmitter(level = bunyan.DEBUG) {
    const self = this;
    const levelName = bunyan.nameFromLevel[level];
    return function log({
      event = null, details, err, limitOutput = true, bindings = {},
    } = {}) {
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
   * Builds a bunyan structured logger and binds the common fields we're interested
   * in from AWS Lambda Context object
   * @param context: objectContext
   */
  getStructuredLogger(context) {
    return bunyan.createLogger({
      name: this.name,
      aws_lambda_name: context.functionName,
      internal_service_tag: this.name,
      level: LogUtils.getSystemLogLevel(),
      aws_lambda_request_id: context.awsRequestId,
      functionVersion: context.functionVersion,
      serializers: {
        err: serializers.error,
        error: serializers.error,
        context: serializers.context,
        interim_desc: serializers.interim_desc,
      },
      streams: [
        {
          type: 'raw',
          stream: this.stream,
        },
      ],
    });
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
      interim_desc: details,
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


module.exports = StructLog;
