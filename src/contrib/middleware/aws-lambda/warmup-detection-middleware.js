const { CancelExecutionError } = require('../../../errors');
const { reach } = require('@hapi/hoek');

module.exports = (state) => {
  let result = null;
  if (reach(state, 'event.source') === 'serverless-plugin-warmup') {
    result = new CancelExecutionError();

    state.logger.info({
      event: 'TRACE',
      details:
          'serverless plugin warm-up invocation, skipping processing',
      limitOutput: false,
      bindings: { state: 'Skip' },
    });
  }
  return result;
};
