/** @module logging-utils */
const bunyan = require('bunyan');
const _ = require('lodash');
/**
 * @class
 * Common logging utils
 */
class LogUtils {
  /**
   * Attempts to set the system log level from an ENV VAR ($LOG_LEVEL)
   * The Var can be a string representation of the level name or a numeric-like string
   * If the ENV VAR is not present sets to DEBUG as the default
   * @returns {number}
   */
  static getSystemLogLevel() {
    if (!process.env.LOG_LEVEL) {
      return bunyan.DEBUG;
    }
    try {
      const numericLevel = LogUtils.getNumericLogLevel();
      if (numericLevel) {
        return numericLevel;
      }
      return bunyan.levelFromName[process.env.LOG_LEVEL.toLowerCase()] || bunyan.DEBUG;
    } catch (e) {
      console.error('Problem parsing log level', e);
    }
    return bunyan.DEBUG;
  }

  /**
   * Attempts to convert a numeric-like string to a log level
   * @returns {number}
   */
  static getNumericLogLevel() {
    const level = parseInt(process.env.LOG_LEVEL, 10);
    if (_.isFinite(level)) {
      if (bunyan.nameFromLevel[level]) {
        return level;
      }
    }
    return null;
  }

  /**
   * Attempts to set the system log entry max length from an ENV VAR (MAX_LOG_LENGTH)
   * If the ENV VAR is not present sets to 20000 as the default
   * @returns {number}
   */
  static getMaxLogLength() {
    let maxLength = 20000;
    if (process.env.MAX_LOG_LENGTH) {
      const check = parseInt(process.env.MAX_LOG_LENGTH, 10);
      if (_.isFinite(check)) {
        maxLength = check;
      }
    }
    return maxLength;
  }
}

module.exports = LogUtils;
