
const { Wavelength, errors, contrib: { middleware: { aws: { lambdaWarmupMiddleware } } } } = require('../../../src');
const Context = require('../../util/lambda-context-mock');
const { createAPIGatewayEvent } = require('../../util/api-gateway-event-mock');
const { errors: { awsAPIG: apiErrors } } = require('../../../src/contrib');

describe('Testing Runtime Engine', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });
  it('checks skips warmup plugin', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();
    event.source = 'serverless-plugin-warmup';
    const app = new Wavelength({ name: 'Test API', event, context: contextMock });

    app.middleWare.use([lambdaWarmupMiddleware,
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    const result = await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
    expect(result.statusCode).toBe(444);
    const response = JSON.parse(result.body);
    expect(response.cancelled).toBeTruthy();
  });
  it('checks app runs async style success path', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength({ name: 'Test API', event, context: contextMock });

    app.middleWare.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      Object.assign(state, { requestResult: 200 });
    }]);

    const result = await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
    expect(JSON.parse(result.body).status).toBe(200);
  });
  it('checks app runs callback style success path', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    function callback(err, response) {
      expect(JSON.parse(response.body).status).toBe(200);
    }
    const app = new Wavelength({
      name: 'Test API', event, context: contextMock, callback,
    });

    app.middleWare.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      Object.assign(state, { requestResult: 200 });
    }]);

    await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
  });

  it('checks propagates async style middleware error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength({ name: 'Test API', event, context: contextMock });

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      },
      function errorMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        return new apiErrors.Base4xxException('Someone set us up the bomb');
      }]);

    const result = await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.message).toBe('Error: Someone set us up the bomb');
  });

  it('checks propagates callback style middleware error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();
    function callback(err, response) {
      expect(response).toBeUndefined();
      expect(err.statusCode).toBe(400);
      const responseBody = JSON.parse(err.body);
      expect(responseBody.message).toBe('Error: Someone set us up the bomb');
    }
    const app = new Wavelength({
      name: 'Test API', event, context: contextMock, callback,
    });

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      },
      function errorMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        return new apiErrors.Base4xxException('Someone set us up the bomb');
      }]);

    await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
  });


  it('checks propagates async style handler error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength({ name: 'Test API', event, context: contextMock });

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    const result = await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      throw new apiErrors.Base4xxException('Someone set us up the bomb');
    });
    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.message).toBe('Error: Someone set us up the bomb');
  });

  it('checks propagates callback style handler error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();
    function callback(err, response) {
      expect(response).toBeUndefined();
      expect(err.statusCode).toBe(400);
      const responseBody = JSON.parse(err.body);
      expect(responseBody.message).toBe('Error: Someone set us up the bomb');
    }
    const app = new Wavelength({
      name: 'Test API', event, context: contextMock, callback,
    });

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      throw new apiErrors.Base4xxException('Someone set us up the bomb');
    });
  });

  it('checks status code in state is applied to response', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength({ name: 'Test API', event, context: contextMock });

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { status: 201 });
      }]);

    const result = await app.run(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { success: true };
    });
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ success: true });
  });
});
