
const serializers = require('../../../src/logging/serializers');
const { serializers: { details } } = require('../../../src/contrib/logging/aws/buffered-cloudwatch-logger');


describe('Testing Serializers', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });

  it('checks that "log" and "child" is removed from context objects', () => {
    const contextObject = {
      prop1: 'I\'m a property!',
      prop2: 'Another property!!!',
      log: 'Awesome logger stuff',
      child: 'possible child loggers here',
    };
    const result = serializers.context(contextObject);

    expect(result.log).toBe(undefined);
    expect(result.child).toBe(undefined);
    expect(result.prop1).toBe('I\'m a property!');
    expect(result.prop2).toBe('Another property!!!');
  });

  it('checks that standard errors are formatted as bunyan errors', () => {
    const result = serializers.error(ReferenceError());

    expect(Object.getOwnPropertyDescriptor(result, 'signal')).toBeTruthy();
  });


  it('checks that pii is removed interim_desc', () => {
    const logEvent = {
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
    const result = details(logEvent.details);


    expect(result.requestContext.authorizer.claims['persisted:']).toBe('*');
    expect(result.requestContext.authorizer.claims['cognito:username:']).toBe('*');
    expect(result.requestContext.authorizer.claims.email).toBe('*');
    expect(result.requestContext.authorizer.claims.sub).toBe('some persisted value');
  });

  it('checks that pii is removed interim_desc as string', () => {
    const logEvent = JSON.stringify({
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
    });
    const result = details(logEvent);

    expect(result.requestContext.authorizer.claims['persisted:']).toBe('*');
    expect(result.requestContext.authorizer.claims['cognito:username:']).toBe('*');
    expect(result.requestContext.authorizer.claims.email).toBe('*');
    expect(result.requestContext.authorizer.claims.sub).toBe('some persisted value');
  });

  it('checks that pii removal passes through string', () => {
    const logEvent = 'All your logs are belong to us';
    const result = details(logEvent);

    expect(result).toBe(logEvent);
  });

  it('checks that pii removal passes through number', () => {
    const logEvent = 1234567890;
    const result = details(logEvent);

    expect(result).toBe(logEvent);
  });
});
