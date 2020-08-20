const Context = require('../../util/lambda-context-mock');
const { StructLog } = require('../../../src/logging');
const { HandlerState } = require('../../../src/runtime/handler-state');

function getState(name = 'Test') {
  const contextMock = new Context();
  const logger = new StructLog(name, contextMock);
  return new HandlerState(name, { req: true }, contextMock, logger);
}

const testArray = [1, 2, 3];

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

  it('checks can add to state', () => {
    const state = getState();
    state.push({ prop: testArray });
    expect(state.prop).toBe(testArray);
  });

  it('checks can remove from state', () => {
    const state = getState();
    state.push({ prop: testArray });
    expect(state.prop).toBe(testArray);

    const result = state.pop(state.prop);

    expect(result).toBe(testArray);

    expect(state.prop).toBeUndefined();
  });

  it('checks can remove from state via key', () => {
    const state = getState();
    state.push({ prop: testArray });
    expect(state.prop).toBe(testArray);

    const result = state.pop('prop');

    expect(result).toBe(testArray);

    expect(state.prop).toBeUndefined();
  });
});
