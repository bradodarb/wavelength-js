const { Attempt, RetryError, Retry } = require('../../../src/utils/retrying');


describe('Testing Retry', () => {

  beforeAll((done) => {
    jest.setTimeout(30000);
    done();
  });
  beforeAll((done) => {
    jest.setTimeout(30000);
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    jest.setTimeout(5000);
    done();
  });

  it('retries max attempts and errors', async () => {
    jest.setTimeout(30000);
    const max = 2;
    const failMock = jest.fn();
    failMock.mockImplementation(() => {
      throw new Error();
    });
    const retrier = new Retry({ maxAttempts: max, sleepMultiplier: 1 });
    try {
      await retrier.call(failMock);
    } catch (e) {
      expect(failMock.mock.calls.length).toBe(max);
    }
  });

  it('retries max attempts then succeeds', async () => {
    const max = 3;
    const failMock = jest.fn();
    failMock.mockImplementationOnce(() => {
      throw new Error();
    });
    failMock.mockImplementationOnce(() => {
      throw new Error();
    });
    failMock.mockImplementationOnce(() => true);

    const retrier = new Retry({ maxAttempts: max, sleepMultiplier: 1 });
    const result = await retrier.call(failMock);
    expect(result).toBeTruthy();
  });

  it('retries max attempts with exponential backoff', async () => {
    const max = 3;
    const failMock = jest.fn();
    const epsilon = max;
    const maxMult = 10;
    failMock.mockImplementation(() => {
      throw new Error();
    });

    const retrier = new Retry({
      maxAttempts: max, waitExpMultiplier: maxMult, sleepMultiplier: 1,
    });
    const start = Date.now();
    try {
      await retrier.call(failMock);
    } catch (e) {
      const stop = Date.now();
      const elapsed = (stop - start);
      const expected = Math.abs(elapsed - ((maxMult * 2) + (maxMult * 4)));
      expect(failMock.mock.calls.length).toBe(max);
      expect(expected <= epsilon).toBeTruthy();
    }
  });

  it('retries max attempts with exponential backoff using expMax', async () => {
    const max = 3;
    const failMock = jest.fn();
    const epsilon = max;
    const waitMax = 10;
    failMock.mockImplementation(() => {
      throw new Error();
    });

    const retrier = new Retry({
      maxAttempts: max, waitExpMax: waitMax, waitExpMultiplier: 100, sleepMultiplier: 1,
    });
    const start = Date.now();
    try {
      await retrier.call(failMock);
    } catch (e) {
      const stop = Date.now();
      const elapsed = (stop - start);
      const expected = Math.abs(elapsed - (waitMax * (max - 1)));
      expect(failMock.mock.calls.length).toBe(max);
      expect(expected <= epsilon).toBeTruthy();
    }
  });
});

describe('Testing Retry Internals', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    jest.setTimeout(5000);
    done();
  });
  it('stop function key is passed by ctor params and stops when expected', async () => {
    const max = 3;
    const retrier = new Retry({
      stop: 'stopAfterAttempt',
    });
    retrier.maxAttempts = max;
    expect(retrier.stop(1)).toBeFalsy();
    expect(retrier.stop(2)).toBeFalsy();
    expect(retrier.stop(3)).toBeTruthy();
  });
  it('stop is passed by ctor params and stops when expected', async () => {
    function stop(attempt, delay) {
      return attempt + delay === 7;
    }

    const retrier = new Retry({
      stopFunc: stop,
    });

    expect(retrier.stop(5, 1)).toBeFalsy();
    expect(retrier.stop(6, 1)).toBeTruthy();
    expect(retrier.stop(7, 1)).toBeFalsy();
    expect(retrier.stop(8, 1)).toBeFalsy();
  });
  it('stop is passed by ctor params and overridden by maxAttempts stops when expected', async () => {
    const max = 3;

    function stop(attempt, delay) {
      return attempt + delay === 7;
    }

    const retrier = new Retry({
      maxAttempts: max,
      stopFunc: stop,
    });

    expect(retrier.stop(max)).toBeTruthy();
    expect(retrier.stop(6, 1)).toBeTruthy();
  });
  it('stopAfterAttempt is configured by ctor params and stops when expected', async () => {
    const max = 3;
    const waitMax = 10;
    const retrier = new Retry({
      maxAttempts: max, waitExpMax: waitMax, waitExpMultiplier: 100, sleepMultiplier: 1,
    });
    expect(retrier.stop(1)).toBeFalsy();
    expect(retrier.stop(2)).toBeFalsy();
    expect(retrier.stop(3)).toBeTruthy();
  });

  it('stopAfterDelay is configured by ctor params and stops when expected', async () => {
    const max = 3;

    const retrier = new Retry({
      maxDelay: max, sleepMultiplier: 1,
    });
    expect(retrier.stop(0, 1)).toBeFalsy();
    expect(retrier.stop(0, 2)).toBeFalsy();
    expect(retrier.stop(0, 3)).toBeTruthy();
  });


  it('fixedSleep is configured by ctor params and waits as expected', async () => {
    const max = 3;

    const retrier = new Retry({
      waitFixed: max,
    });
    expect(retrier.wait(0, 1)).toBe(max);
  });


  it('randomSleep is configured by ctor params and waits as expected', async () => {
    const max = 30;

    const retrier = new Retry({
      waitRandomMin: 1, waitRandomMax: max,
    });
    const wait1 = retrier.wait(0, 1);
    const wait2 = retrier.wait(0, 1);
    expect(wait1).toBeLessThanOrEqual(max);
    expect(wait2).toBeLessThanOrEqual(max);
    expect(wait1 === wait2).toBeFalsy();
  });

  it('incrementalSleep is configured by ctor params and waits as expected', async () => {
    const max = 8;

    const retrier = new Retry({
      waitIncStart: 0,
      waitInc: 2,
      waitIncMax: max,
    });
    expect(retrier.wait(0)).toBe(0);
    expect(retrier.wait(1)).toBe(0);
    expect(retrier.wait(2)).toBe(2);
    expect(retrier.wait(3)).toBe(4);
    expect(retrier.wait(4)).toBe(6);
    expect(retrier.wait(5)).toBe(max);
    expect(retrier.wait(6)).toBe(max);
    expect(retrier.wait(100)).toBe(max);
  });

  it('exponentialSleep is configured by ctor params and waits as expected', async () => {
    const max = 8;

    const retrier = new Retry({
      waitExpMultiplier: -1,
      waitExpMax: max,
    });
    expect(retrier.wait(1)).toBe(0);
    retrier.waitExpMultiplier = 1;
    expect(retrier.wait(0)).toBe(1);
    expect(retrier.wait(1)).toBe(2);
    expect(retrier.wait(2)).toBe(4);
    expect(retrier.wait(3)).toBe(8);
    expect(retrier.wait(4)).toBe(max);
    expect(retrier.wait(5)).toBe(max);
    expect(retrier.wait(6)).toBe(max);
    expect(retrier.wait(100)).toBe(max);
  });

  it('waitFunc is configured by ctor params and waits as expected', async () => {
    const max = 8;
    function waiter() {
      return Math.sin(max);
    }
    const retrier = new Retry({
      waitFunc: waiter,
    });
    expect(retrier.wait(0)).toBe(Math.sin(max));
  });
  it('waitFunc as key is configured by ctor params and waits as expected', async () => {
    const max = 8;

    const retrier = new Retry({
      wait: 'fixedSleep',
    });
    retrier.waitFixed = max;
    expect(retrier.wait(0)).toBe(max);
  });
  it('noSleep returns 0 always', async () => {
    expect(Retry.noSleep()).toBe(0);
  });
});
describe('Testing Attempt', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    jest.setTimeout(5000);
    done();
  });

  it('gets value', async () => {
    const val = 'Test Value';
    const attempt = new Attempt(val, 1, false);
    expect(attempt.get()).toBe(val);
    expect(attempt.toString()).toBe('Attempt 1 Value: Test Value');
  });
  it('throws error', async () => {
    const val = new Error('Test Error');
    const attempt = new Attempt(val, 1, true);

    expect(attempt.get).toThrow(Error);
  });
  it('throws wrapped error', async () => {
    const val = new Error('Test Error');
    const attempt = new Attempt(val, 1, true);

    expect(() => attempt.get(true)).toThrow(RetryError);
    try {
      attempt.get(true);
    } catch (e) {
      expect(e.toString().startsWith('RetryError[Attempt 1, Error:')).toBeTruthy();
    }
  });
});
