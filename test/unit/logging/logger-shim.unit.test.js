const { patchConsole, bootstrapHandlerLogging } = require('../../../src');
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

function innerCallback(val, callback) {
  callback(val);
}

class TestHandler {
  handler1(event, context, callback) {
    return this.helper1();
  }

  handler2(event, context, callback) {
    return this.helper2();
  }

  helper1() {
    return 'Helper 1';
  }

  helper2() {
    return 'Helper 2';
  }
}
class TestCallbackHandler {
  handler1(event, context, callback) {
    callback(null, this.helper1());
  }

  handler2(event, context, callback) {
    callback(null, this.helper2());
  }

  helper1() {
    return 'Helper 1';
  }

  helper2() {
    return 'Helper 2';
  }
}
describe('Testing Log Shim', () => {
  beforeAll((done) => {
    console.debug = function debug(...args) {
      events.push(...args);
    };
    done();
  });
  beforeEach((done) => {
    events = [];
    done();
  });
  afterAll((done) => {
    console.debug = ogDebug;
    done();
  });

  it('does not emit events < warning until flush is called', () => {
    patchConsole(null, {}, new Context());
    console.info('red', eventMock, { hello: 'world!' });

    expect(events.length).toBe(0);
    console.flush();
    expect(events.length).toBe(1);
  });

  it('emits events in the order received', () => {
    process.env.LOG_LEVEL = 'debug';
    patchConsole(null, {}, new Context());
    console.log(1, eventMock, { hello: 'world!' });
    console.log(2, eventMock, { hello: 'world!' });
    console.log(3, eventMock, { hello: 'world!' });

    console.error(4, eventMock, { hello: 'world!' }, false);
    console.error(5, eventMock, { hello: 'world!' }, new Error('Test Error'));


    expect(events.length).toBe(2);
    console.flush();
    expect(events.length).toBe(3);
    const { items } = JSON.parse(events[2]);

    expect(items.length).toBe(7);

    expect(items[1].event).toBe('1');
    expect(items[2].event).toBe('2');
    expect(items[3].event).toBe('3');
    expect(items[4].event).toBe('4');
    expect(items[5].event).toBe('5');
  });

  it('adds key/vals to subsequent logs after bind', () => {
    patchConsole(null, {}, new Context());
    console.info('red', eventMock, { hello: 'world!' });
    console.bind({ alert: 'RED' });
    console.info('red', eventMock, { hello: 'world!' });
    expect(events.length).toBe(0);
    console.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);

    expect(items[1].alert).toBeUndefined();
    expect(items[2].alert).toBe('RED');
  });

  it('wraps async style handler', async () => {
    const expectation = 'completed in the test fixture';

    function testHandler(event, context) {
      console.info('intro to logging', { event, context });
      console.info('test', 'testing the log bootstrapper', { things: 'things' });
      console.append({ red: 'alert' });
      return { event: expectation };
    }

    const handler = bootstrapHandlerLogging(testHandler, 'Test Logger');

    const result = await handler({ event: 'test event' }, new Context());

    expect(result.event).toBe('completed in the test fixture');
    const { items, red } = JSON.parse(events[0]);
    expect(items.length).toBe(4);
    expect(red).toEqual('alert');
    expect(items[3].return_result.event).toBe(expectation);
  });

  it('wraps async style class level handler fails', async () => {
    const expectation = 'completed in the test fixture';
    const handler = new TestHandler();


    const wrappedHandler = bootstrapHandlerLogging(handler.handler1, 'Test Logger');
    try {
      await wrappedHandler({ event: 'test event' }, new Context());
    } catch (e) {
      expect(e instanceof TypeError).toBeTruthy();
      expect(String(e)).toBe('TypeError: Cannot read property \'helper1\' of undefined');
    }
  });
  it('wraps async style class level handler', async () => {
    const wrappedHandler = bootstrapHandlerLogging(async (event, context) => {
      const handler = new TestHandler();
      return handler.handler1();
    }, 'Test Logger');
    const result = await wrappedHandler({ event: 'test event' }, new Context());
    expect(result).toBe('Helper 1');
  });


  it('wraps callback style handler', (done) => {
    const expectation = 'completed in the test fixture';

    function testHandler(event, context, callback) {
      console.metrics.counter('testCounter').inc(123);
      console.info('intro to logging', { event, context });
      console.info('test', 'testing the log bootstrapper', { things: 'things' });
      console.metrics.counter('testCounter').dec(23);
      callback(null, { event: expectation });
    }

    const handler = bootstrapHandlerLogging(testHandler, 'Test Logger');

    handler({ event: 'test event' }, new Context(),
      (err, val) => {
        expect(err).toBe(null);
        expect(val.event).toBe(expectation);

        // eslint-disable-next-line camelcase
        const { items, return_status, metrics } = JSON.parse(events[0]);
        expect(items.length).toBe(4);
        expect(items[3].return_result.event).toBe(expectation);
        expect(return_status.event).toBe(expectation);
        expect(metrics.counters.testCounter).toBe(100);
        done();
      });
  });

  it('wraps callback style handler and returns error to log', (done) => {
    const expectation = 'completed in the test fixture';
    const errMessage = 'someone set us up the bomb';

    function testHandler(event, context, callback) {
      console.info('intro to logging', { event, context });
      console.info('test', 'testing the log bootstrapper', { things: 'things' });
      callback({ badThing: errMessage }, { event: expectation });
    }

    const handler = bootstrapHandlerLogging(testHandler, 'Test Logger');

    handler({ event: 'test event' }, new Context(),
      (err, val) => {
        expect(err.badThing).toBe('someone set us up the bomb');
        expect(val.event).toBe(expectation);
        // eslint-disable-next-line camelcase
        const { items, return_status } = JSON.parse(events[0]);
        expect(items.length).toBe(4);
        expect(items[3].return_result.badThing).toBe(errMessage);
        expect(return_status.badThing).toBe(errMessage);
        done();
      });
  });

  it('wraps nested callback style handler', (done) => {
    const expectation = 'completed in the test fixture';

    function testHandler(event, context, callback) {
      innerCallback({ event: expectation }, () => {
        console.info('intro to logging', { event, context });
        console.info('test', 'testing the log bootstrapper', { things: 'things' });
        callback(null, { event: expectation });
      });
    }

    const handler = bootstrapHandlerLogging(testHandler, 'Test Logger');

    handler({ event: 'test event' }, new Context(),
      (err, val) => {
        expect(val.event).toBe(expectation);
        const { items } = JSON.parse(events[0]);
        expect(items.length).toBe(4);
        expect(items[3].return_result.event).toBe(expectation);
        done();
      });
  });

  it('wraps callback style class level handler fails', async () => {
    const handler = new TestCallbackHandler();


    const wrappedHandler = bootstrapHandlerLogging(handler.handler1, 'Test Logger');
    try {
      await wrappedHandler({ event: 'test event' }, new Context());
    } catch (e) {
      expect(e instanceof TypeError).toBeTruthy();
      expect(String(e)).toBe('TypeError: Cannot read property \'helper1\' of undefined');
    }
  });
  it('wraps callback style class level handler', async () => {
    function testCallback(err, result) {
      expect(err).toBeNull();
    }
    const wrappedHandler = bootstrapHandlerLogging(async (event, context, callback) => {
      const handler = new TestCallbackHandler();
      handler.handler1(event, context, callback);
    }, 'Test Logger');
    const result = await wrappedHandler({ event: 'test event' }, new Context(), testCallback);
    expect(result).toBe('Helper 1');
  });
});
