/* eslint-disable prefer-rest-params */
/** @module legacy-logger */

const { StructLog } = require('.');
/**
 * Monkey patches the global console object so that it can emit structured logs
 * @param name {string} Logger name
 * @param context {object} incoming AWS lambda context object
 * @param  stream {WritableStream}
 */
function patchConsole(name, context, stream = undefined) {
  const logger = new StructLog(name, stream);
  logger.context = context;
  console.bind = logger.bind.bind(logger);
  console.log = logger.debug.bind(logger);
  console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);
  console.flush = logger.flush.bind(logger);
  console.append = logger.append.bind(logger.logger);
}

module.exports.patchConsole = patchConsole;
