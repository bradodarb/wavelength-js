import bodyMiddleware from '../../../../../../src/contrib/middleware/aws/lambda/event-body-middleware'
describe('body middleware', () => {
  it('valid event', async () => {
    const state = {
      push: (val) => {
        Object.assign(state, val);
      },
      logger: {
        info: jest.fn(),
      },
      event: {
        body: {
          abc: 123,
        },
      },
    };
    expect(state.body).toBeUndefined();
    const response = bodyMiddleware(state);

    expect(response).toEqual(null);
    expect(state.body).toEqual({
      abc: 123,
    });
  });
  it('valid serialized event', async () => {
    const state = {
      push: (val) => {
        Object.assign(state, val);
      },
      logger: {
        info: jest.fn(),
      },
      event: {
        body: JSON.stringify({
          abc: 123,
        }),
      },
    };
    expect(state.body).toBeUndefined();
    const response = bodyMiddleware(state);

    expect(response).toEqual(null);
    expect(state.body).toEqual({
      abc: 123,
    });
  });
  it('invalid event', async () => {
    const state = {
      logger: {
        error: jest.fn(),
      },
    };
    const response = bodyMiddleware(state);

    expect(response.error).toEqual('Invalid Event Body');
    expect(response.reason).toEqual('Unable to parse body from event');
  });
});
