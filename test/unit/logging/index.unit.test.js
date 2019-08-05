const bunyan = require('bunyan');
const { StructLog, pii } = require('../../../src');
const LogUtils =  require('../../../src/logging/logging-utils');
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

const fullEventMock = {
  resource: '/',
  path: '/',
  httpMethod: 'POST',
  headers: {
    'Authorization': 'Bearer eyJraWQiOiJrUFh6T0lcL2Z1YTNUY3cwMlludGhxb3dQN3F2RGoxZ1ZQUDV6d2lYU0labz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1NDAyYTMzMy0xZDJmLTQ4OTYtYTdjOS03MWQ5NmVjNmI5NDIiLCJldmVudF9pZCI6ImI2OTI3YzMwLWQ0NDctMTFlOC1iMzRhLTJmYjQzYWMzNjNlYiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE1NDAwMjY1MTAsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1JOb2RUa3VOQyIsImV4cCI6MTU0MDAzMDExMCwiaWF0IjoxNTQwMDI2NTEwLCJqdGkiOiI4ODhlYmY3Yy0yNGZkLTRmYTQtODRjYS1lZTZkODQ5MWRlZjAiLCJjbGllbnRfaWQiOiI2MzFuY2pibmVsazg1NGtvamphcGo1NTN0aCIsInVzZXJuYW1lIjoiNTQwMmEzMzMtMWQyZi00ODk2LWE3YzktNzFkOTZlYzZiOTQyIn0.BJwnfiYx-FYIVNbJ37N-QjBYqn1maRsI-DGyJZUSzyQu2JmR64psRE0SrDDfwMXP_fbHm9unDP09rXo3sZuaf3FEqBAXqRoRQ0bZYFVlfrM-azw2_d35Za9rvhOBm-8df-OeTwX3F8CqW41wCQo23ciYq8WRa2AZM4U0RgVJjDNIf6pDY9sfEtqIQKw-2IutxQFcHP7LWWcjXSz2l_3DuGrHp5qUvpVSPT6R194neGTxVozHT0a1_MgNjgPxk_JqOBmXfmN_MAoZKXrJ5I-8lNdBzF5WHFSi15d__731oebd6r97-sbnUiONppKS64ogQiiC8EZESCUU2I1PXY0Phw',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.8,en;q=0.6,zh-CN;q=0.4',
    'cache-control': 'max-age=0',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'GB',
    'content-type': 'application/x-www-form-urlencoded',
    'Host': 'j3ap25j034.execute-api.eu-west-2.amazonaws.com',
    'origin': 'https://j3ap25j034.execute-api.eu-west-2.amazonaws.com',
    'Referer': 'https://j3ap25j034.execute-api.eu-west-2.amazonaws.com/dev/',
    'upgrade-insecure-requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
    'Via': '2.0 a3650115c5e21e2b5d133ce84464bea3.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': '0nDeiXnReyHYCkv8cc150MWCFCLFPbJoTs1mexDuKe2WJwK5ANgv2A==',
    'X-Amzn-Trace-Id': 'Root=1-597079de-75fec8453f6fd4812414a4cd',
    'X-Forwarded-For': '50.129.117.14, 50.112.234.94',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https',
  },
  queryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {
    path: '/dev/',
    accountId: '125002137610',
    resourceId: 'qdolsr1yhk',
    stage: 'dev',
    requestId: '0f2431a2-6d2f-11e7-b75152aa497861',
    authorizer: {
      claims: {
        'sub': '96cb3dae-d30c-47a9-b98e-2bbedf578cbd',
        'cognito:groups': 'us-west-2_RNodTkuNC_LoginWithAmazon',
        'username': 'LoginWithAmazon_101234947641768',
        'email': 'nunya@darn.biz',
      },
    },
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      apiKey: '',
      sourceIp: '50.129.117.14',
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
      user: null,
    },
    resourcePath: '/',
    httpMethod: 'POST',
    apiId: 'j3azlsj0c4',
    step1: {
      step2: {
        step3: {
          preserve: 'huckleberry',
          keepMe: 'sample value',
          prop202: 'dubious proposition',
          rules: [1, 2, 3],
          nested: {
            prop203: 'this should be gone',
          },
        },
      },
    },
  },
  body: '{"first_name":"jameszzz"}',
  isBase64Encoded: false,
};

let events = [];
const ogDebug = console.debug;

describe('Testing StructLog', () => {
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

  it('does not emit events < warning until flush is called', () => {
    const logger = new StructLog(null, new Context());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });

    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);
  });
  it('immediately emits events > warning and also adds to buffer', () => {
    const logger = new StructLog(null, new Context());
    logger.error({
      event: 'red alert', details: eventMock, bindings: { hello: 'world!' }, err: new Error('Test Error'),
    });

    expect(events.length).toBe(1);
    logger.flush();
    expect(events.length).toBe(2);
  });
  it('emits events in the order received', () => {
    process.env.LOG_LEVEL = 'debug';
    const logger = new StructLog(null, new Context());
    logger.debug({ event: 1, details: eventMock, bindings: { hello: 'world!' } });

    logger.info({ event: 2, details: eventMock, bindings: { hello: 'world!' } });

    logger.warn({ event: 3, details: eventMock, bindings: { hello: 'world!' } });

    logger.error({
      event: 4, details: eventMock, bindings: { hello: 'world!' }, limitOutput: false,
    });

    logger.critical({
      event: 5, details: eventMock, bindings: { hello: 'world!' }, err: new Error('Test Error'),
    });

    expect(events.length).toBe(2);
    logger.flush();
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
    const logger = new StructLog(null, new Context());
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    logger.bind({ alert: 'RED' });
    logger.info({ event: 'red', details: eventMock, bindings: { hello: 'world!' } });
    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);

    expect(items[0].alert).toBeUndefined();
    expect(items[1].alert).toBe('RED');
  });

  it('emits default log level when process.env is not set', () => {
    const level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.DEBUG);
  });
  it('emits default log level when process.env is bad value', () => {
    process.env.LOG_LEVEL = 'all the things';
    const level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.DEBUG);
  });
  it('resolves log level from number-like value from process.env', () => {
    process.env.LOG_LEVEL = '10';
    let level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.TRACE);

    process.env.LOG_LEVEL = '20';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.DEBUG);

    process.env.LOG_LEVEL = '30';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.INFO);

    process.env.LOG_LEVEL = '40';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.WARN);

    process.env.LOG_LEVEL = '50';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.ERROR);

    process.env.LOG_LEVEL = '60';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.FATAL);
  });


  it('resolves log level from case-insensitive level name from process.env', () => {
    process.env.LOG_LEVEL = 'TRACE';
    let level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.TRACE);

    process.env.LOG_LEVEL = 'trace';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.TRACE);

    process.env.LOG_LEVEL = 'DEBUG';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.DEBUG);

    process.env.LOG_LEVEL = 'debug';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.DEBUG);

    process.env.LOG_LEVEL = 'INFO';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.INFO);

    process.env.LOG_LEVEL = 'info';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.INFO);

    process.env.LOG_LEVEL = 'WARN';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.WARN);

    process.env.LOG_LEVEL = 'warn';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.WARN);

    process.env.LOG_LEVEL = 'ERROR';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.ERROR);

    process.env.LOG_LEVEL = 'error';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.ERROR);

    process.env.LOG_LEVEL = 'FATAL';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.FATAL);

    process.env.LOG_LEVEL = 'fatal';
    level = LogUtils.getSystemLogLevel();
    expect(level).toBe(bunyan.FATAL);
  });

  it('scrubs global pii from objects', () => {
    const logger = new StructLog(null, new Context(), pii.defaultFilters());
    const event = Object.assign(eventMock,
      {
        body: {
          user: 'a user',
          username: 'a user',
          userName: 'a user',
          email: 'nunya@darn.biz',
          password: '8675309',
          passWord: '8675309',
        },
      });
    logger.info({ event: 'red', details: event, bindings: { hello: 'world!', email: 'nunya@darn.biz' } });
    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);

    expect(items[0].email).toBe('*');
    expect(items[0].interim_desc.body.user).toBe('*');
    expect(items[0].interim_desc.body.username).toBe('*');
    expect(items[0].interim_desc.body.userName).toBe('*');
    expect(items[0].interim_desc.body.email).toBe('*');
    expect(items[0].interim_desc.body.password).toBe('*');
    expect(items[0].interim_desc.body.passWord).toBe('*');
  });

  it('scrubs global pii from stringified objects', () => {
    const logger = new StructLog(null, new Context(), pii.defaultFilters());
    const event = Object.assign(eventMock,
      {
        body: '{"user":"a user","username":"a user","userName":"a user","email":"nunya@darn.biz","password":"8675309","passWord":"8675309"}',
      });
    logger.info({ event: 'red', details: event, bindings: { hello: 'world!', email: 'nunya@darn.biz' } });
    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);

    expect(items[0].email).toBe('*');
    const { body } = items[0].interim_desc;
    expect(body.user).toBe('*');
    expect(body.username).toBe('*');
    expect(body.userName).toBe('*');
    expect(body.email).toBe('*');
    expect(body.password).toBe('*');
    expect(body.passWord).toBe('*');
  });

  it('scrubs pii from event', () => {
    const logger = new StructLog(null, new Context(), pii.defaultFilters());

    logger.info({
      event: 'TRACE',
      bindings: {
        lambda_event: fullEventMock,
        state: 'Invoked',
        context: new Context(),
      },
    });
    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);
    expect(items[0].lambda_event.requestContext.authorizer.claims.sub).toBe('96cb3dae-d30c-47a9-b98e-2bbedf578cbd');
    expect(items[0].lambda_event.requestContext.authorizer.claims.username).toBe('*');
    expect(items[0].lambda_event.requestContext.authorizer.claims.email).toBe('*');
  });

  it('scrubs pii from event and additional info with custom filter', () => {
    const filters = [
      function testFilter(record) {
        return pii.scrubWhitelist(record, 'lambda_event.requestContext.step1.step2.step3', ['keepMe', 'preserve']);
      },
    ];
    const logger = new StructLog(null, new Context(), pii.defaultFilters(filters));

    logger.info({
      event: 'TRACE',
      bindings: {
        lambda_event: fullEventMock,
        state: 'Invoked',
        context: new Context(),
      },
    });
    expect(events.length).toBe(0);
    logger.flush();
    expect(events.length).toBe(1);

    const { items } = JSON.parse(events[0]);
    const record = items[0];
    expect(record.lambda_event.requestContext.authorizer.claims.sub).toBe('96cb3dae-d30c-47a9-b98e-2bbedf578cbd');
    expect(record.lambda_event.requestContext.authorizer.claims.username).toBe('*');
    expect(record.lambda_event.requestContext.authorizer.claims.email).toBe('*');

    expect(record.lambda_event.requestContext.step1.step2.step3.keepMe).toBe('sample value');
    expect(record.lambda_event.requestContext.step1.step2.step3.preserve).toBe('huckleberry');
    expect(record.lambda_event.requestContext.step1.step2.step3.prop202).toBe('*');
    expect(record.lambda_event.requestContext.step1.step2.step3.rules).toEqual(['*', '*', '*']);
    expect(record.lambda_event.requestContext.step1.step2.step3.nested).toEqual({ prop203: '*' });
  });
});
