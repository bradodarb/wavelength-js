/** @module metrics.set */

/**
 * @class
 * MetricsSet Log Inoculator
 */
class MetricsSet {
  /**
   * Builds a set class instance from initial values
   * @param name {string} name of this set
   * @param initialValue {array} where this set starts at
   */
  constructor(name, initialValue = []) {
    this.name = name;
    this.value = new Set(initialValue);
  }

  /**
   * Set this set to the supplied value
   * @param value {*}
   */
  update(value = []) {
    this.value = new Set(value);
  }

  /**
   * Add an item to the set
   * @param value {*}
   */
  append(value) {
    this.value.add(value);
  }

  /**
   * Delete an item from the set
   * @param value {*}
   */
  remove(value) {
    this.value.delete(value);
  }

  /**
   * Clear the set
   */
  reset() {
    this.value.clear();
  }

  /**
   * Represent JSON for log output
   * @returns {any[]}
   */
  format() {
    return [...this.value];
  }
}


module.exports = MetricsSet;
