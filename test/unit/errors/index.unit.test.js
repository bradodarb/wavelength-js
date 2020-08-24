import {
  Base401Exception, Base403Exception, Base404Exception,
  Base409Exception,
  Base415Exception,
  Base422Exception, Base424Exception, Base429Exception, Base4xxException, Base5xxException
} from "../../../src/contrib/errors/aws/apig";

const { errors } = require('../../../src');

const Context = require('../../util/lambda-context-mock');


const testContext = new Context();
describe('Testing Errors', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });

  it('checks that CancelExecutionError is an exception', () => {
    const error = new errors.CancelExecutionError();

    expect(error instanceof Error).toBeTruthy();
  });

  it('checks that BaseException.getResponse object is formatted correctly', () => {
    const error = new errors.BaseException('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.error.code).toBe(418);
    expect(response.error.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base4xxException.getResponse object is formatted correctly', () => {
    const error = new Base4xxException('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext, 400);
    expect(response.statusCode).toBe(400);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base401Exception.getResponse object is formatted correctly', () => {
    const error = new Base401Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(401);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base403Exception.getResponse object is formatted correctly', () => {
    const error = new Base403Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(403);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base404Exception.getResponse object is formatted correctly', () => {
    const error = new Base404Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(404);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base409Exception.getResponse object is formatted correctly', () => {
    const error = new Base409Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(409);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base415Exception.getResponse object is formatted correctly', () => {
    const error = new Base415Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(415);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base422Exception.getResponse object is formatted correctly', () => {
    const error = new Base422Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(422);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base424Exception.getResponse object is formatted correctly', () => {
    const error = new Base424Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(424);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });

  it('checks that Base429Exception.getResponse object is formatted correctly', () => {
    const error = new Base429Exception('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext);
    expect(response.statusCode).toBe(429);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });


  it('checks that Base5xxException.getResponse object is formatted correctly', () => {
    const error = new Base5xxException('Test Error', 'Someone set us up the bomb', 418);
    const response = error.getResponse(testContext, 500);
    expect(response.statusCode).toBe(500);

    expect(response.error.code).toBe(418);
    expect(response.message).toBe('Error: Test Error');
    expect(response.error.reason).toBe('Someone set us up the bomb');
    expect(response.error.requestId).toBeDefined();
    expect(response.error.path).toBeDefined();
  });
});
