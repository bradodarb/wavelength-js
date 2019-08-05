/** @module metrics.counter */
const _ = require('lodash');

/**
 * @class
 * MetricsCounter Log Inoculator
 */
class MetricsCounter {
  /**
   * Builds a counter class instance from initial values
   * @param name {string} name of this counter
   * @param initialValue {number} where this counter starts at
   */
  constructor(name, initialValue = 0) {
    this.name = name;
    this.value = initialValue;
  }

  /**
   * Increments this counter by the supplied amount
   * @param value {number} value to increment by
   */
  inc(value = 1) {
    if (MetricsCounter.checkValue(value)) {
      this.value += value;
    }
  }

  /**
   * Decrements this counter by the supplied amount
   * @param value {number} value to increment by
   */
  dec(value = 1) {
    if (MetricsCounter.checkValue(value)) {
      this.value -= value;
    }
  }

  /**
   * Represent JSON for log output
   * @returns {{[p: string]: number}}
   */
  format() {
    return this.value;
  }

  /**
   * Ensure the input is valid to change this counter
   * @param value {number}
   * @returns {*} {boolean}
   */
  static checkValue(value) {
    const valid = _.isFinite(value);
    if (!valid) {
      console.warn('Invalid input for counter');
    }
    return valid;
  }
}


module.exports = MetricsCounter;
