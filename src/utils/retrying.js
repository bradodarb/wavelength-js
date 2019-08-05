/** @module retrying */

/* eslint-disable no-unused-vars,no-await-in-loop,no-constant-condition */
const _ = require('lodash');

/**
 * @class
 * Wraps an attempt for retry conditions where the attempt needs to be retrieved
 */
class RetryError extends Error {
  constructor(attempt) {
    super(attempt.toString());
    this.attempt = attempt;
  }

  /**
   * Formats the error
   * @returns {string}
   */
  toString() {
    return `RetryError[${this.attempt}]`;
  }
}
/**
 * @class
 * Encapsulates the result of an method call attempt in the retry call
 */
class Attempt {
  constructor(value, attemptNumber, hasException = false) {
    this.value = value;
    this.attemptNumber = attemptNumber;
    this.hasException = hasException;
  }

  /**
   * Gets the result from the attempt
   * @param wrapException {boolean}
   * @returns {*}
   */
  get(wrapException = false) {
    if (this.hasException) {
      if (wrapException) {
        throw new RetryError(this);
      }
      throw this.value;
    }
    return this.value;
  }

  /**
   * Formats the attempt
   * @returns {string}
   */
  toString() {
    if (this.hasException) {
      return `Attempt ${this.attemptNumber}, Error: \n ${this.value.stack}`;
    }
    return `Attempt ${this.attemptNumber} Value: ${this.value}`;
  }
}
/**
 * @class
 * Configurable retrying mechanism
 */
class Retry {
  /**
   * Ctor for the Retry instance, options passed in determine when and how retries are performed
   * @param stop {string} function name on Retry class
   * used to determine if attempts should cease
   * @param wait {string} function name on Retry class
   * used to determine how long to wait until the next attempt
   * @param waitFixed {number} specific amount of time to wait between attempts
   * @param waitExpMultiplier {number} exponential multiplier
   * @param waitExpMax {number} top threshold for exponential waits
   * @param waitIncStart {number} base time to wait for exponential back-off
   * @param waitInc {number} amount to increment for each attempt
   * @param waitIncMax {number} top threshold for incremental waits
   * @param waitRandomMin {number} lower bounds for random wait calculation
   * @param waitRandomMax {number} upper bounds for random wait calculation
   * @param maxAttempts {number} threshold for attempts before stopping
   * @param maxDelay {number} threshold for waits between attempts
   * @param retryOnExceptions {function} function to evaluate when an
   * exception occurs to determine whether to retry
   * @param retryOnResult {function} function to evaluate from a
   * call result to determine whether to retry
   * @param stopFunc {function} custom stop check function
   * to determine if attempts should cease
   * @param waitFunc {function} custom wait function to determine
   * how long to wait until the next attempt
   * @param wrapException {boolean} Determines whether to wrap a
   * given exception with a RetryError
   * @param sleepMultiplier {number} Time scale
   */
  constructor({
    stop,
    wait,
    waitFixed,
    waitExpMultiplier,
    waitExpMax,
    waitIncStart,
    waitInc,
    waitIncMax,
    waitRandomMin,
    waitRandomMax,
    maxAttempts,
    maxDelay,
    retryOnExceptions = Retry.alwaysReject,
    retryOnResult = Retry.neverReject,
    stopFunc,
    waitFunc,
    wrapException = false,
    sleepMultiplier,
  } = {}) {
    this.resolveStopFunction({
      maxAttempts,
      maxDelay,
      stopFunc,
      stop,
    });
    this.resolveWaitFunction({
      waitFixed,
      waitFunc,
      wait,
      waitRandomMin,
      waitRandomMax,
      waitIncStart,
      waitInc,
      waitExpMultiplier,
      waitExpMax,
    });
    this.maxAttempts = maxAttempts || 5;
    this.maxDelay = maxDelay || 100;
    this.retryOnExceptions = retryOnExceptions;
    this.retryOnResult = retryOnResult;
    this.waitExpMultiplier = waitExpMultiplier || 1;
    this.waitExpMax = waitExpMax || Number.MAX_SAFE_INTEGER;
    this.waitFixed = waitFixed || 1000;
    this.waitIncStart = waitIncStart || 0;
    this.waitInc = waitInc || 100;
    this.waitIncMax = waitIncMax || Number.MAX_SAFE_INTEGER;
    this.waitRandomMin = waitRandomMin || 0;
    this.waitRandomMax = waitRandomMax || 1000;
    this.wrapException = wrapException;
    this.sleepMultiplier = sleepMultiplier || 1000;
  }

  /**
   * Configures how stops are evaluated
   * @param maxAttempts {number} threshold for attempts before stopping
   * @param maxDelay {number} threshold for waits between attempts
   * @param stopFunc {function} custom stop check function
   * to determine if attempts should cease
   * @param stop {string} function name on Retry class
   * used to determine if attempts should cease
   */
  resolveStopFunction({
    maxAttempts,
    maxDelay, stopFunc,
    stop,
  } = {}) {
    const stopFunctions = [];
    if (maxAttempts) {
      stopFunctions.push(this.stopAfterAttempt.bind(this));
    }
    if (maxDelay) {
      stopFunctions.push(this.stopAfterDelay.bind(this));
    }
    if (stopFunc && _.isFunction(stopFunc)) {
      stopFunctions.push(stopFunc);
    }
    if (stop && this[stop] && _.isFunction(this[stop])) {
      stopFunctions.push(this[stop].bind(this));
    }
    this.stop = function checkStops(attempt, delay) {
      return stopFunctions.some(check => check(attempt, delay));
    };
  }

  /**
   * Configures how time between attempts are calculated
   * @param waitFixed {number} specific amount of time to wait between attempts
   * @param waitFunc {function} custom wait function to determine
   * how long to wait until the next attempt
   * @param wait {string} function name on Retry class
   * used to determine how long to wait until the next attempt
   * @param waitRandomMin {number} lower bounds for random wait calculation
   * @param waitRandomMax {number} upper bounds for random wait calculation
   * @param waitIncStart {number} base time to wait for exponential back-off
   * @param waitInc {number} amount to increment for each attempt
   * @param waitExpMultiplier {number} exponential multiplier
   * @param waitExpMax {number} top threshold for exponential waits
   */
  resolveWaitFunction({
    waitFixed, waitFunc, wait,
    waitRandomMin, waitRandomMax,
    waitIncStart, waitInc,
    waitExpMultiplier, waitExpMax,
  } = {}) {
    const waitFunctions = [];
    if (waitFixed) {
      waitFunctions.push(this.fixedSleep.bind(this));
    }
    if (waitRandomMin || waitRandomMax) {
      waitFunctions.push(this.randomSleep.bind(this));
    }
    if (waitIncStart || waitInc) {
      waitFunctions.push(this.incrementalSleep.bind(this));
    }
    if (waitExpMultiplier || waitExpMax) {
      waitFunctions.push(this.exponentialSleep.bind(this));
    }
    if (waitFunc && _.isFunction(waitFunc)) {
      waitFunctions.push(waitFunc);
    }
    if (wait && this[wait] && _.isFunction(this[wait])) {
      waitFunctions.push(this[wait].bind(this));
    }
    this.wait = function getWaitTime(attempt, delay) {
      const waits = waitFunctions.map(check => check(attempt, delay));
      return Math.max(...waits);
    };
  }


  /**
   * Don't sleep at all before retrying
   * @returns {number}
   */
  static noSleep() {
    return 0;
  }

  /**
   * Sleep a fixed amount of time between each retry
   * @returns {number|*}
   */
  fixedSleep() {
    return this.waitFixed;
  }

  /**
   * Sleep a random amount of time between waitRandomMin and waitRandomMax
   * @returns {number}
   */
  randomSleep() {
    const min = Math.ceil(this.waitRandomMin);
    const max = Math.floor(this.waitRandomMax);
    // maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Sleep an incremental amount of time after each attempt, starting at
   * waitIncStart and incrementing by waitInc
   * @param previousAttempt {number}
   * @param initialDelay  {number}
   * @returns {number} Bound between zero and waitIncMax
   */
  incrementalSleep(previousAttempt, initialDelay) {
    let result = this.waitIncStart + (this.waitInc * (previousAttempt - 1));
    if (result > this.waitIncMax) {
      result = this.waitIncMax;
    }
    if (result < 0) {
      result = 0;
    }
    return result;
  }

  /**
   * Compute the next exponential sleep increment
   * @param previousAttempt {number}
   * @param initialDelay {number}
   * @returns {number}
   */
  exponentialSleep(previousAttempt, initialDelay) {
    const exp = 2 ** previousAttempt;
    let result = this.waitExpMultiplier * exp;
    if (result > this.waitExpMax) {
      result = this.waitExpMax;
    }
    if (result < 0) {
      result = 0;
    }
    return result;
  }

  /**
   * Returns an awaitable set to the time scaled by sleepMultiplier
   * @param timeout
   * @returns {Promise<any>}
   */
  sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout * this.sleepMultiplier));
  }

  /**
   * Determine if we need to stop based on time
   * @param previousAttempt {number}
   * @param initialDelay {number}
   * @returns {boolean}
   */
  stopAfterDelay(previousAttempt, initialDelay) {
    return initialDelay >= this.maxDelay;
  }

  /**
   * Determine if we need to stop based on how many tries we've made
   * @param previousAttempt {number}
   * @param initialDelay {number}
   * @returns {boolean}
   */
  stopAfterAttempt(previousAttempt, initialDelay) {
    return previousAttempt >= this.maxAttempts;
  }

  /**
   * Simple stop function used to retry forever
   * @returns {boolean}
   */
  static neverReject() {
    return false;
  }

  /**
   * Simple stop function used to never retry
   * @returns {boolean}
   */
  static alwaysReject() {
    return true;
  }

  /**
   * Used to determine if a retry should happen based on custom evaluation functions
   * either for exceptions or call results
   * @param attempt
   * @returns {*}
   */
  shouldReject(attempt) {
    if (attempt.hasException) {
      return this.retryOnExceptions(attempt.value);
    }
    return this.retryOnResult(attempt.value);
  }

  /**
   * Actual retry mecahnism
   * Depending on how this instance was configured will perform retry attempts
   * @param fn {function}
   * @returns {Promise<*>}
   */
  async call(fn) {
    const startTime = Date.now();
    let deltaTime;
    let currentAttempt = 1;
    let attempt = null;
    while (true) {
      try {
        attempt = new Attempt(await fn(), currentAttempt, false);
      } catch (e) {
        attempt = new Attempt(e, currentAttempt, true);
      }
      if (!this.shouldReject(attempt)) {
        return attempt.get(this.wrapException);
      }
      deltaTime = Date.now() - startTime;

      if (this.stop(currentAttempt, deltaTime)) {
        if (!this.wrapException && attempt.hasException) {
          throw attempt.get();
        }
        throw new RetryError(attempt);
      } else {
        const napTime = this.wait(currentAttempt, deltaTime);
        await this.sleep(napTime);
        // We really do want to wait for each item
      }
      currentAttempt += 1;
    }
  }
}


module.exports = {
  Retry,
  Attempt,
  RetryError,
};
