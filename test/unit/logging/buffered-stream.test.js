const { StructLog } = require('../../../src');
const BufferedLogStream = require('../../../src/logging/buffered-stream');
const Context = require('../../util/lambda-context-mock');
const datas = require('../../testData/scottish-parliment-events.json');

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
let ogDebug = null;
let events = [];
describe('Testing Buffered Stream and friends', () => {
  beforeAll((done) => {
    ogDebug = console.debug;

    console.debug = function (...args) {
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

  it('truncates messages properly', () => {
    const stream = new BufferedLogStream(100);
    stream.write({
      maxLength: 20,
      event: 'test_event',
      interim_desc: JSON.stringify(datas),
    });
    stream.write({
      maxLength: 200,
      event: 'test_event 2',
      interim_desc: JSON.stringify(datas),
    });
    stream.drain();
    expect(events.length).toBe(1);

    const payload = JSON.parse(events[0]);
    expect(payload.items[0].interim_desc).toBe('TRUNCATED:[{"ID":1,"Date":"201');
    expect(payload.items[1].interim_desc).toBe('TRUNCATED:[{"ID":1,"Date":"2015-09-01T00:00:00","Title":"European North Sea Energy Alliance","Sponsor":"Christina McKelvie MSP"},{"ID":2,"Date":"2015-09-01T00:00:00","Title":"AS it is","Sponsor":"Margaret McCul');
  });

  it('formats Buffer type objects properly', () => {
    const stream = new BufferedLogStream(100);
    const buffer = Buffer.from(JSON.stringify(datas), 'utf-8');

    stream.write({
      maxLength: 200,
      event: 'test_event',
      interim_desc: 'Making sure buffer doesn\'t runneth over',
      response: buffer,
    });
    stream.drain();
    expect(events.length).toBe(1);

    const payload = JSON.parse(events[0]);
    expect(payload.items[0].response).toBe('[Buffer Object]');
  });
});
