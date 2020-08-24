/** @module handlerstate */
const _ = require('lodash');
/**
 * @class
 * State repository for lambda execution
 */
export default class HandlerState {
  constructor(name, event, context, logger) {
    this.name = name;
    this.event = event;
    this.context = context;
    this.logger = logger;
    this.error = null;
    this.response = {};
  }

  /**
   * Adds an object to this state
   * @param value {*}
   */
  push(value) {
    Object.assign(this, value);
  }

  /**
   * Removes an object from state
   * @param value {(string | *)}
   * @returns {*}
   */
  pop(value) {
    let result = null;

    if (_.isString(value)) {
      result = this[value];
      delete this[value];
    } else {
      Object.keys(this).forEach((key) => {
        if (this[key] === value) {
          result = this[key];
          delete this[key];
        }
      });
    }
    return result;
  }
}
