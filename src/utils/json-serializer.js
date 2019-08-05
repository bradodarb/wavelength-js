/** @module json-serializer */

const _ = require('lodash');
/**
 * Custom serializer function to use with JSON.parse that truncates circular references
 * @returns {Function}
 */
module.exports.serializer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
};
/**
 * Converts any input into a string
 * @param source {*}
 * @returns {string}
 */
module.exports.safeString = function safeString(source) {
  if (_.isNil(source)) {
    return '';
  }
  if (_.isObject(source)) {
    return JSON.stringify(source);
  }
  if (_.isString(source)) {
    return source;
  }
  return String(source);
};
