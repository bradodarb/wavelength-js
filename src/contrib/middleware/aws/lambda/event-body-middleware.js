const { apig: errors } = require('../../../errors');

module.exports = (state) => {
  let result = null;
  try {
    state.logger.info({ event: 'Middleware executing', details: 'Body Parsing Middleware' });
    let { body } = state.event;

    if (typeof body === 'string' || body instanceof String) {
      body = JSON.parse(state.event.body);
    }

    if (!body) {
      body = {};
    }

    state.push({ body });
    state.logger.info({
      event: 'Middleware executed',
      details: 'Body Parsing Middleware',
      bindings: { body },
    });
  } catch (err) {
    state.logger.error({ event: 'Error Parsing Body', err });
    result = new errors.Base422Exception(
      'Invalid Event Body',
      'Unable to parse body from event', '0000',
    );
  }
  return result;
};
