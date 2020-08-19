const { CancelExecutionError } = require('../../../errors');
const { get } = require('lodash');

module.exports = (state) => {
  let result = null;
  if (get(state, 'event.source') === 'serverless-plugin-warmup') {
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
