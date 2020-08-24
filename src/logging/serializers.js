/** @module log-serializers */
const _ = require('lodash');
const bunyan = require('bunyan');

module.exports = {
  /**
   * Formats log key objects named 'context'
   * @param ctx {object}
   * @returns {object}
   */
  context(ctx) {
    return _.omit(ctx, ['log', 'logger', 'child']);
  },
  /**
   * Formats Error objects for log output
   * @param err {Error}
   * @returns {object}
   */
  error(err) {
    const bunyanError = bunyan.stdSerializers.err(err);
    if (!_.isObject(err) || !_.isObject(bunyanError)) {
      return bunyanError;
    }

    return _.assign({}, err, bunyanError);
  },

};
