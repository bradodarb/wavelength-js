
const StructLog = require('../../../src/logging');
const { HandlerState } = require('../../../src/runtime/handler-state');
const { Decay } = require('../../../src');
const { Base422Exception } = require('../../../src/errors');
const Context = require('../../util/lambda-context-mock');

async function terminal(err, context) {
  if (err) {
    context.logger.error({ err, bindings: { ware: 'TERMINATOR' } });
    context.logger.flush();
    // context.end(err);
  }
}
function getState(name = 'Test') {
  const contextMock = new Context();
  const logger = new StructLog(name, contextMock);
  return new HandlerState(name, { req: true }, contextMock, logger);
}
describe('Testing Middleware Engine', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });

  it('checks that middlewares are executed in the order they were registered', async () => {
    const app = new Decay(terminal);

    app.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      state.middlewareOrder.push(1);
    }, async function sampleMiddleWare2(state) {
      state.logger.info({ bindings: { state, ...{ ware: 2 } } });
      state.middlewareOrder.push(2);
      state.logger.info({ event: 'Stuff', details: 'The time is nigh!', bindings: { state, ...{ ware: 2 } } });
    }, function sampleMiddleWare3(state) {
      state.logger.info({ bindings: { state, ...{ ware: 3 } } });
      state.middlewareOrder.push(3);
    }]);


    const state = getState();
    state.middlewareOrder = [];


    await app.invoke(state);

    expect(state.middlewareOrder[0]).toBe(1);
    expect(state.middlewareOrder[1]).toBe(2);
    expect(state.middlewareOrder[2]).toBe(3);
  });

  it('works with async middleware', async () => {
    const app = new Decay(terminal);
    app.use([
      async function sampleMiddleWare(state) {
        state.logger.info({ bindings: { state, ...{ ware: 1 } } });
        state.middlewareOrder.push(1);
      }, async function sampleMiddleWare2(state) {
        state.logger.info({ bindings: { state, ...{ ware: 2 } } });
        await new Promise(resolve => setTimeout(resolve, 200));
        state.middlewareOrder.push(2);
      }, async function sampleMiddleWare3(state) {
        state.logger.info({ bindings: { state, ...{ ware: 3 } } });
        state.middlewareOrder.push(3);
      }]);

    let state = getState();
    state.middlewareOrder = [];


    app.invoke(state);

    expect(state.middlewareOrder.length).toBe(1);


    state = getState();
    state.middlewareOrder = [];

    await app.invoke(state);
    expect(state.middlewareOrder[0]).toBe(1);
    expect(state.middlewareOrder[1]).toBe(2);
    expect(state.middlewareOrder[2]).toBe(3);
  });

  it('stops execution when an error is thrown', async () => {
    const app = new Decay(terminal);

    app.use([function sampleMiddleWare(state) {
      state.logger.info({ bindings: { state, ...{ ware: 1 } } });
      state.middlewareOrder.push(1);
    }, function sampleMiddleWare2(state) {
      state.logger.info({ bindings: { state, ...{ ware: 2 } } });
      state.middlewareOrder.push(2);
      return new Base422Exception('bad things', 'bla', 1234);
    }, function sampleMiddleWare3(state) {
      state.logger.info({ bindings: { state, ...{ ware: 3 } } });
      state.middlewareOrder.push(3);
    }]);


    const state = getState();
    state.middlewareOrder = [];


    await app.invoke(state);

    expect(state.middlewareOrder[0]).toBe(1);
    expect(state.middlewareOrder[1]).toBe(2);
  });
});
