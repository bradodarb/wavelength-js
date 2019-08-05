/** @module pii */

const _ = require('lodash');

const FILTER_VALUE = '*';

/**
 * Attempts to return JSON from a string, otherwise passes through if source is not a string
 * @param source any
 * @returns { (null | object) }
 */
function coerceJSON(source) {
  let result = null;

  if (_.isString(source)) {
    try {
      result = JSON.parse(source);
    } catch (e) {
      // nada
    }
  }

  return result;
}

/**
 * Replaces properties on an object where the keys are not in the passed in whitelist
 * @param source {object} object to replace non-whitelisted properties with
 * @param key {string} current key to check whitelist for
 * @param whitelist {[string]}
 * @returns {object} The modified source object
 */
function whiteList(source, key, whitelist) {
  if (whitelist.indexOf(key) < 0) {
    Object.assign(source, { [key]: FILTER_VALUE });
  }
  return source;
}

/**
 * Replaces properties on an object where the keys are in the passed in blacklist
 * @param source {object} object to replace properties when the key in contained in the blacklist
 * @param key {string} current key to check whitelist for
 * @param blacklist {[string]}
 * @returns {object} The modified source object
 */
function blackList(source, key, blacklist) {
  if (blacklist.indexOf(key) > -1) {
    Object.assign(source, { [key]: FILTER_VALUE });
  }
  return source;
}

/**
 * Attempts to scrub an object that was coerced from a stringified JSON blob
 * Skips depth check
 * @param source {object} deserialized object
 * @param filters {[string]}
 * @param filterOp {function} whiteList, blackList or custom
 * @returns {(null | object)} if the string was successfully coerced we send it back after scrubbing
 */
function handleStringifiedObject(source, filters, filterOp) {
  if (source && _.isObject(source)) {
    return module.exports.scrub({
      source,
      filters,
      filterOp,
    });
  }
  return null;
}

/**
 * Generic filter function to handle objects andstringifieds objects
 * @param source {object} incoming object to filter
 * @param key {string} current property to target
 * @param filters {[string]}
 * @param filterOp {function} whiteList, blackList or custom
 * @param depth {number} current recursion step
 * @param maxDepth {number} max recursion depth allowed
 * @returns {*}
 */
function filter({
  source, key, filters, filterOp, depth, maxDepth,
} = {}) {
  if (_.isString(source[key])) {
    const childObject = handleStringifiedObject(coerceJSON(source[key]), filters, filterOp);
    if (childObject) {
      return childObject;
    }
  } else if (_.isObject(source[key])) {
    return module.exports.scrub({
      source: source[key],
      filters,
      filterOp,
      depth: depth + 1,
      maxDepth,
    });
  }
  filterOp(source, key, filters);
  return source[key];
}

/**
 * Attempt to pull a specific chunk via dot-notation path string for filtering
 * @param source {object} incoming object to pull from
 * @param path {string} dot notated object path string
 * @returns {(undefined|object)} if the path is falsey,
 * we just short circuit and return the incoming object,
 * if the path object isn't false we try to pull the nested object out and return it.
 * if the path did not yield an object from source it will return undefined
 */
function getTarget(source, path) {
  if (!path) {
    return source;
  }
  return _.get(source, path);
}

/**
 * Iterate over an object (or optionally a partial object if a valid targetPath is supplied)
 * and scrub sensitive information based on supplied filter list and filter operation
 * @param source {object} incoming object to scrub
 * @param targetPath {string} dot notated object path string
 * @param filters {[string]}
 * @param filterOp {function} whiteList, blackList or custom
 * @param depth {number} current recursion step
 * @param maxDepth {number} max recursion depth allowed
 */
function scrub({
  source, targetPath, filters, filterOp, depth = 0, maxDepth = 0,
} = {}) {
  try {
    if (maxDepth && depth >= maxDepth) {
      return source;
    }
    if (source && _.isObject(source)) {
      const target = getTarget(source, targetPath);
      if (!target) {
        return source;
      }
      Object.keys(target).forEach((key) => {
        target[key] = filter({
          source: target,
          key,
          filters,
          filterOp,
          depth,
          maxDepth,
        });
      });

      if (targetPath) {
        _.set(source, targetPath, target);
      }
    }
  } catch (e) {
    console.debug(`Error scrubbing PII: ${e}`);
  }
  return source;
}

/**
 * Convenience method to call scrub with a blacklist strategy
 * @param source {object} incoming object to scrub
 * @param targetPath {string} dot notated object path string
 * @param blacklist {[string]}
 * @param maxDepth {number} max recursion depth allowed
 * @returns {Object}
 */
function scrubBlacklist(source, targetPath, blacklist, maxDepth = 0) {
  return scrub({
    source: coerceJSON(source) || source,
    targetPath,
    filters: blacklist,
    filterOp: blackList,
    maxDepth,
  });
}
/**
 * Convenience method to call scrub with a whitelist strategy
 * @param source {object} incoming object to scrub
 * @param targetPath {string} dot notated object path string
 * @param whitelist {[string]}
 * @param maxDepth {number} max recursion depth allowed
 * @returns {Object}
 */
function scrubWhitelist(source, targetPath, whitelist, maxDepth = 0) {
  return scrub({
    source: coerceJSON(source) || source,
    targetPath,
    filters: whitelist,
    filterOp: whiteList,
    maxDepth,
  });
}

/**
 * Mechanism to build default filters for scrubbing log events
 * This might be removed once the services are matured and contain their own
 * specific filters
 * @param additionalFilters {[function]} an array of optional filter functions
 * @returns {[function]}
 */
function defaultFilters(additionalFilters = []) {
  return [record => scrubBlacklist(record, null, ['email', 'username', 'userName', 'user', 'password', 'passWord'], 5),
    ...additionalFilters];
}

module.exports = {
  scrub,
  scrubBlacklist,
  scrubWhitelist,
  defaultFilters,
};
