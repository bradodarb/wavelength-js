/** @module metrics.timer */

/**
 * @class
 * MetricsTimer Log Inoculator
 */
class MetricsTimer {
  /**
   * Builds a timer class instance from initial values
   * @param name {string} name of this timer
   */
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.value = 0;
  }

  /**
   * Start this timer
   * Ensures the value is reset
   */
  start() {
    this.startTime = new Date().getTime();
    this.value = 0;
  }

  /**
   * Stops the timer and computes the value, then resets the startTime
   * @returns {number} timer result
   */
  stop() {
    if (!this.startTime) {
      console.warn('Timer stopped without being started');
    }
    this.value = new Date().getTime() - this.startTime;
    this.startTime = null;
    return this.value;
  }

  /**
   * Represent JSON for log output
   * @returns {{[p: string]: number}}
   */
  format() {
    return this.value;
  }
}


module.exports = MetricsTimer;
