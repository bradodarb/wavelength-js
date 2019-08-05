const bunyan = require('bunyan');
const { StructLog, pii, Metrics } = require('../../../src');
const LogUtils = require('../../../src/logging/logging-utils');
const Context = require('../../util/lambda-context-mock');

const eventMock = {
  interim_desc: {
    requestContext: {
      authorizer: {
        claims: {
          'persisted:': 'persisted val',
          'cognito:username:': 'usernam val',
          'email': 'email val',
          'sub': 'some persisted value',
        },
      },
    },
  },
};


let events = [];
const ogDebug = console.debug;

describe('Testing StructLog Metrics', () => {
  beforeAll((done) => {
    console.debug = function debug(...args) {
      events.push(...args);
      console.log(...args);
    };
    done();
  });
  beforeEach((done) => {
    delete process.env.LOG_LEVEL;
    events = [];
    done();
  });
  afterAll((done) => {
    console.debug = ogDebug;
    done();
  });

  it('Adds timer to metrics output', async () => {
    const logger = new StructLog(null, new Context());
    logger.inoculate('metrics', new Metrics.MetricsInoculator());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    logger.metrics.timer('testTimer').start();
    async function testTimerOutput() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            logger.metrics.timer('testTimer').stop();
            expect(events.length).toBe(0);
            logger.flush();
            expect(events.length).toBe(1);
            const output = JSON.parse(events[0]);
            expect(output.metrics.timers.testTimer).toBeGreaterThan(0);
          } catch (e) {
            reject(e);
          }
          resolve();
        }, 10);
      });
    }
    await testTimerOutput();
  });

  it('Adds counter to metrics output', async () => {
    const logger = new StructLog(null, new Context());
    logger.inoculate('metrics', new Metrics.MetricsInoculator());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    const testCounter = logger.metrics.counter('testCounter');

    testCounter.inc(100);

    testCounter.inc(10);


    testCounter.inc(1);

    expect(testCounter.value).toBe(111);


    testCounter.dec(1);

    logger.flush();
    expect(events.length).toBe(1);
    const output = JSON.parse(events[0]);

    expect(output.metrics.counters.testCounter).toBe(110);
  });


  it('Adds gauge to metrics output', async () => {
    const logger = new StructLog(null, new Context());
    logger.inoculate('metrics', new Metrics.MetricsInoculator());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    logger.metrics.gauge('testGauge1').update(100);

    logger.metrics.gauge('testGauge2').update(10);


    logger.metrics.gauge('testGauge3').update(1);

    logger.flush();
    expect(events.length).toBe(1);
    const output = JSON.parse(events[0]);

    expect(output.metrics.gauges.testGauge1).toBe(100);
    expect(output.metrics.gauges.testGauge2).toBe(10);
    expect(output.metrics.gauges.testGauge3).toBe(1);
  });


  it('Adds set to metrics output', async () => {
    const logger = new StructLog(null, new Context());
    logger.inoculate('metrics', new Metrics.MetricsInoculator());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    const testSet = logger.metrics.set('testSet');

    testSet.update([1, 2, 'three']);
    testSet.append('IV');

    testSet.append(1);

    expect(testSet.format()).toEqual([1,2,'three', 'IV']);

    testSet.remove('three');

    expect(testSet.format()).toEqual([1,2, 'IV']);

    testSet.reset();
    expect(testSet.format()).toEqual([]);


    testSet.update([1, 2, 3]);


    logger.flush();
    expect(events.length).toBe(1);
    const output = JSON.parse(events[0]);

    expect(output.metrics.sets.testSet).toEqual([1, 2, 3]);
  });
});
