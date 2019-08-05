/** @module metrics.gauge */

/**
 * @class
 * MetricsGauge Log Inoculator
 */
class MetricsGauge {
  /**
   * Builds a gauge class instance from initial values
   * @param name {string} name of this gauge
   * @param initialValue {*} where this gauge starts at
   */
  constructor(name, initialValue) {
    this.name = name;
    this.value = initialValue;
  }

  /**
   * Set this gauge to the supplied value
   * @param value {*}
   */
  update(value) {
    this.value = value;
  }

  /**
   * Represent JSON for log output
   * @returns {{[p: string]: number}}
   */
  format() {
    return this.value;
  }
}


module.exports = MetricsGauge;
