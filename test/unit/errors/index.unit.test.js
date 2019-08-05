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

  it('checks that BaseException.getResponse object is formatted correctly', () => {
    const error = new errors.CancelExecutionError();

    expect(error instanceof Error).toBeTruthy();
  });

  it('checks that BaseException.getResponse object is formatted correctly', () => {
    const error = new errors.BaseException('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext, 400);
    expect(reponse.statusCode).toBe(400);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base4xxException.getResponse object is formatted correctly', () => {
    const error = new errors.Base4xxException('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext, 400);
    expect(reponse.statusCode).toBe(400);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base401Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base401Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(401);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base403Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base403Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(403);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base404Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base404Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(404);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base409Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base409Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(409);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base415Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base415Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(415);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base422Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base422Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(422);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base424Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base424Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(424);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });

  it('checks that Base429Exception.getResponse object is formatted correctly', () => {
    const error = new errors.Base429Exception('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext);
    expect(reponse.statusCode).toBe(429);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });


  it('checks that Base5xxException.getResponse object is formatted correctly', () => {
    const error = new errors.Base5xxException('Test Error', 'Someone set us up the bomb', 418);
    const reponse = error.getResponse(testContext, 500);
    expect(reponse.statusCode).toBe(500);
    const responseBody = JSON.parse(reponse.body);
    expect(responseBody.error.code).toBe(418);
    expect(responseBody.message).toBe('Error: Test Error');
    expect(responseBody.error.reason).toBe('Someone set us up the bomb');
    expect(responseBody.error.requestId).toBeDefined();
    expect(responseBody.error.path).toBeDefined();
  });
});
