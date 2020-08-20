
const {
  Wavelength, contrib: {
    middleware: { aws: { lambdaWarmupMiddleware } },
    logging: { aws: { BufferedCloudWatchLogger } },
  }, Container, pii,
} = require('../../../src');
const { BufferedLogStream } = require('../../../src/logging/buffered-stream');
const Context = require('../../util/lambda-context-mock');
const { createAPIGatewayEvent } = require('../../util/api-gateway-event-mock');
const { errors: { aws: { apig: apiErrors } } } = require('../../../src/contrib');

const ioc = new Container();
ioc.register('logger', ioc => new BufferedCloudWatchLogger('Tester', ioc.logStream));
ioc.register('logStream', ioc => new BufferedLogStream(100, ioc.logFilters));
ioc.register('logFilters', ioc => pii.defaultFilters());
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
    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([lambdaWarmupMiddleware,
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    const handler = app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    });
    const result = await handler(event, contextMock);
    expect(result.statusCode).toBe(200);
    const response = JSON.parse(result.body);
    expect(response.cancelled).toBeTruthy();
  });
  it('checks app runs async style success path', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      Object.assign(state, { requestResult: 200 });
    }]);

    const result = await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    })(event, contextMock);
    expect(JSON.parse(result.body).status).toBe(200);
  });
  it('checks app runs callback style success path', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    function callback(err, response) {
      expect(JSON.parse(response.body).status).toBe(200);
    }
    const app = new Wavelength('Test API', ioc.logger);


    app.middleWare.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      Object.assign(state, { requestResult: 200 });
    }]);

    await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    })(event, contextMock, callback);
  });

  it('checks propagates async style middleware error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      },
      function errorMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        return new apiErrors.Base4xxException('Someone set us up the bomb');
      }]);

    const result = await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    })(event, contextMock);
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

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      },
      function errorMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        return new apiErrors.Base4xxException('Someone set us up the bomb');
      }]);

    await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { status: state.requestResult };
    })(event, contextMock, callback);
  });


  it('checks propagates async style handler error correctly', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    const result = await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      throw new apiErrors.Base4xxException('Someone set us up the bomb');
    })(event, contextMock);
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

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { requestResult: 200 });
      }]);

    await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      throw new apiErrors.Base4xxException('Someone set us up the bomb');
    })(event, contextMock, callback);
  });

  it('checks status code in state is applied to response', async () => {
    const event = createAPIGatewayEvent();
    const contextMock = new Context();

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        Object.assign(state, { status: 201 });
      }]);

    const result = await app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { success: true };
    })(event, contextMock);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ success: true });
  });


  it('checks status code in state is applied to response from handler style', async () => {
    const event = createAPIGatewayEvent({ body: 1234 });
    const contextMock = new Context();

    const app = new Wavelength('Test API', ioc.logger);

    app.middleWare.use([
      function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        state.push({ status: 201 });
      }]);

    const handler = app.handler(async (state) => {
      state.logger.info({ event: 'App handler' });
      return { result: state.event.body };
    });
    let result = await handler(event, contextMock);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).result).toEqual(1234);
    event.body = 'abcd';
    result = await handler(event, contextMock);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).result).toEqual('abcd');
  });
});
