/** @module metrics */
const CounterMetric = require('./counter-metric');
const TimerMetric = require('./timer-metric');
const SetMetric = require('./set-metric');
const GaugeMetric = require('./gauge-metric');

/**
 * @class
 * Index Log Inoculator
 */
class MetricsInoculator {
  /**
   * Initializes a Metrics Inoculation class with the default collection state
   */
  constructor() {
    this.reset();
  }

  reset() {
    this.timers = {};
    this.counters = {};
    this.gauges = {};
    this.sets = {};
  }

  /**
   * Access a Set Metric and creates it if it doesn't exist
   * @param name {string} Key for metric
   * @returns {SetMetric}
   */
  set(name) {
    if (!this.sets[name]) {
      this.sets[name] = new SetMetric(name);
    }
    return this.sets[name];
  }

  /**
   * Access a Gauge Metric and creates it if it doesn't exist
   * @param name {string} Key for metric
   * @returns {GaugeMetric}
   */
  gauge(name) {
    if (!this.gauges[name]) {
      this.gauges[name] = new GaugeMetric(name);
    }
    return this.gauges[name];
  }

  /**
   * Access a Timer Metric and creates it if it doesn't exist
   * @param name {string} Key for metric
   * @returns {TimerMetric}
   */
  timer(name) {
    if (!this.timers[name]) {
      this.timers[name] = new TimerMetric(name);
    }
    return this.timers[name];
  }

  /**
   * Access a Counter Metric and creates it if it doesn't exist
   * @param name {string} Key for metric
   * @returns {CounterMetric}
   */
  counter(name) {
    if (!this.counters[name]) {
      this.counters[name] = new CounterMetric(name);
    }
    return this.counters[name];
  }

  /**
   * Compile a set of metrics into an output object
   * @param name {string} property on this class to compile
   * @returns {object}
   * TODO move this to base class if it makes sense
   */
  getCollection(name) {
    let result = null;
    const target = this[name];
    const keys = Object.keys(target);
    if (target && keys) {
      result = {};
      keys.forEach((key) => {
        result[key] = target[key].format();
      });
    }
    return result;
  }

  /**
   * Format all the metrics into the standard output for log entry
   * @returns {object}
   */
  get result() {
    const gauges = this.getCollection('gauges');
    const counters = this.getCollection('counters');
    const timers = this.getCollection('timers');
    const sets = this.getCollection('sets');
    return {
      metrics: {
        gauges,
        counters,
        timers,
        sets,
      },
    };
  }
}

export {
  MetricsInoculator,
  CounterMetric,
  GaugeMetric,
  TimerMetric,
  SetMetric,

};
