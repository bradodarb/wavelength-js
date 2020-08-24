/* eslint-disable no-param-reassign */
/**
 * BufferedStream is a Writable Stream just stores the last N records in
 * memory to dump an chunk size <limit>.
 * Errors are buffered as well but are also immediately logged
 *
 * @param options {Object}, with the following fields:
 *
 *    - limit: number of records to keep in memory
 */
const _ = require('lodash');
const { EventEmitter } = require('events').EventEmitter;

const bunyan = require('bunyan');
const safeStringify = require('fast-safe-stringify');

const levelMap = {
  [bunyan.TRACE]: 'trace',
  [bunyan.DEBUG]: 'debug',
  [bunyan.INFO]: 'info',
  [bunyan.ERROR]: 'error',
  [bunyan.FATAL]: 'fatal',
};

const reverseLevelMap = {
  trace: bunyan.TRACE,
  debug: bunyan.DEBUG,
  info: bunyan.INFO,
  error: bunyan.ERROR,
  fatal: bunyan.FATAL,
};

/**
 * @class
 * Stream-like object used to buffer log events for latent flushing
 */
class BufferedLogStream extends EventEmitter {
  constructor(limit = 100, filters) {
    super();
    this.limit = limit;
    this.writable = true;
    this.records = [];
    this.filters = filters;
    this.additionalItems = [];
    this.buffer = limit > 0;
  }


  /**
   * Write a structured log event
   * Events that have a level of WARN or greater are immediately emitted to console.debug
   * as well as being added to the buffer for chronological integrity
   * @param record {object} log event
   * @returns {BufferedLogStream} Fluent interface function
   */
  write(record) {
    if (!this.writable) {
      throw (new Error('BufferedStream has been ended already'));
    }
    const logRecord = this.sanitize(record);

    if (!this.buffer) {
      BufferedLogStream.dump(logRecord);
      return this;
    }
    if (reverseLevelMap[logRecord.level] > bunyan.WARN) {
      BufferedLogStream.dump(logRecord);
    }
    this.records.push(logRecord);


    if (this.records.length > this.limit) {
      this.drain();
    }

    return this;
  }

  /**
   * Instance level drain function to dump current buffer into
   * console.debug and then reset the buffer
   */
  drain() {
    let record = {
      items: this.records,
    };

    this.additionalItems.forEach((item) => {
      record = Object.assign(record, item);
    });

    BufferedLogStream.dump(record);
    this.records = [];
  }

  /**
   * Deep clones the object to ensure no referenced objects are adversely affected during scrubbing
   * Formats the bunyan log object to the standard format
   * @param record {object} log event
   * @returns {object} formatted and scrubbed loeg event
   */
  sanitize(record) {
    const recordCopy = JSON.parse(BufferedLogStream.serialize(record));
    if (recordCopy.msg) {
      recordCopy.event = recordCopy.msg;
      delete recordCopy.msg;
    }
    let logRecord = Object.assign({}, recordCopy, BufferedLogStream.getRecordDefaults(recordCopy));
    if (this.filters) {
      try {
        this.filters.forEach((filter) => {
          if (_.isFunction(filter)) {
            logRecord = filter(logRecord);
          }
        });
      } catch (e) {
        logRecord = Object.assign({}, recordCopy, BufferedLogStream.getRecordDefaults(recordCopy));
      }
    }
    return logRecord;
  }

  /**
   * Adds a top-level item to the buffered log output
   * @param item {(object||array)}
   */
  add(item) {
    if (!_.isObject(item)) {
      return;
    }
    this.additionalItems.push(item);
  }

  /**
   * Appends the standard log K/V pairs required for every log event
   * @param record {object} original log event
   * @returns {{level: string, event: string, interim_desc: string, name: undefined}}
   */
  static getRecordDefaults(record) {
    const { maxLength: max } = record;
    return {
      level: levelMap[record.level],
      event: BufferedLogStream.truncate(record.event, max),
      details: BufferedLogStream.truncate(record.details, max),
      name: undefined,
    };
  }

  /**
   * Trims a log entry to the system or user supplied max log length
   * @param field {string} text to truncate
   * @param max {number} maximum substring length
   * @returns {string} If the original string is below the threshold it will return that
   * Otherwise it will return a truncated substring that is
   * formatted to indicate that it has been trimmed
   */
  static truncate(field, max) {
    if (max && _.isString(field) && field.length > max) {
      return `TRUNCATED:${field.substring(0, max)}`;
    }
    if ((_.isObject(field) || _.isArray(field))) {
      const check = JSON.stringify(field);
      if (check.length > max) {
        return `TRUNCATED:${check.substring(0, max)}`;
      }
    }
    return field;
  }


  /**
   * Custom serialization for log events to ensure
   * Buffer objects are not natively serialized as LARGE arrays
   * @param source {object} a log event
   */
  static serialize(source) {
    const originalBufferToJSON = Buffer.prototype.toJSON;
    Buffer.prototype.toJSON = () => '[Buffer Object]';

    const result = safeStringify(source);
    Buffer.prototype.toJSON = originalBufferToJSON;

    return result;
  }

  /**
   * Write log event to process.stdout
   * Sending everything to console.debug to avoid Lambda runtime monkey-patching
   *  https://forums.aws.amazon.com/thread.jspa?messageID=739180
   * @param record {*}
   */
  static dump(record) {
    try {
      process.stdout.write(BufferedLogStream.serialize(record));
    } catch (e) {
      // /Swallow errors ...
      // / Known Jest issue where the default reporter overrides console object
    }
  }

  /**
   * Stream interface support
   * see: https://nodejs.org/api/stream.html
   */
  end() {
    this.writable = false;
  }

  /**
   * Stream interface support
   * see: https://nodejs.org/api/stream.html
   */
  destroy() {
    this.writable = false;
    this.emit('close');
  }

  /**
   * Stream interface support
   * see: https://nodejs.org/api/stream.html
   */
  destroySoon() {
    this.destroy();
  }
}

module.exports = { BufferedLogStream };
