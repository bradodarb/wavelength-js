const { patchConsole } = require('../../../src');
const Context = require('../../util/lambda-context-mock');

const eventMock = {
  details: {
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
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
function logSnoop(...args) {
  events.push(...args);
}

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
    process.stdout.write = (chunk, encoding, callback) => {
      logSnoop(chunk);
    };
    done();
  });
  beforeEach((done) => {
    events = [];
    done();
  });
  afterAll((done) => {
    process.stdout.write = originalStdoutWrite;
    done();
  });

  it('does not emit events < warning until flush is called', () => {
    patchConsole('test logger', new Context());
    console.info('red', eventMock, { hello: 'world!' });

    expect(events.length).toBe(0);
    console.flush();
    expect(events.length).toBe(1);
  });

  it('emits events in the order received', () => {
    process.env.LOG_LEVEL = 'debug';
    patchConsole('test logger', new Context());
    console.log(1, eventMock, { hello: 'world!' });
    console.log(2, eventMock, { hello: 'world!' });
    console.log(3, eventMock, { hello: 'world!' });

    console.error(4, eventMock, { hello: 'world!' }, false);
    console.error(5, eventMock, { hello: 'world!' }, new Error('Test Error'));


    expect(events.length).toBe(2);
    console.flush();
    expect(events.length).toBe(3);
    const { items } = JSON.parse(events[2]);

    expect(items.length).toBe(5);

    expect(items[0].event).toBe('1');
    expect(items[1].event).toBe('2');
    expect(items[2].event).toBe('3');
    expect(items[3].event).toBe('4');
    expect(items[4].event).toBe('5');
  });

  it('adds key/vals to subsequent logs after bind', () => {
    patchConsole('test logger', new Context());
    console.info('red', eventMock, { hello: 'world!' });
    console.bind({ alert: 'RED' });
    console.info('red', eventMock, { hello: 'world!' });
    expect(events.length).toBe(0);
    console.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);

    expect(items[0].alert).toBeUndefined();
    expect(items[1].alert).toBe('RED');
  });

});
