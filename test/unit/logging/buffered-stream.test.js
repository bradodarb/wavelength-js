
const BufferedLogStream = require('../../../src/logging/buffered-stream');
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
let events = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
function logSnoop(...args) {
  events.push(...args);
}
describe('Testing Buffered Stream and friends', () => {
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

  it('truncates messages properly', () => {
    const stream = new BufferedLogStream(100);
    stream.write({
      maxLength: 20,
      event: 'test_event',
      details: JSON.stringify(datas),
    });
    stream.write({
      maxLength: 200,
      event: 'test_event 2',
      details: JSON.stringify(datas),
    });
    stream.drain();
    expect(events.length).toBe(1);

    const payload = JSON.parse(events[0]);
    expect(payload.items[0].details).toBe('TRUNCATED:[{"ID":1,"Date":"201');
    expect(payload.items[1].details).toBe('TRUNCATED:[{"ID":1,"Date":"2015-09-01T00:00:00","Title":"European North Sea Energy Alliance","Sponsor":"Christina McKelvie MSP"},{"ID":2,"Date":"2015-09-01T00:00:00","Title":"AS it is","Sponsor":"Margaret McCul');
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
