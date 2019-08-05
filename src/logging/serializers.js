/** @module log-serializers */
const _ = require('lodash');
const bunyan = require('bunyan');
const pii = require('../utils/pii');

const WHITELIST_ATTRS = ['token_use', 'sub', 'locale', 'iat', 'email_verified', 'auth_time', 'aud'];

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
  /**
   * Formats the interim_desc field and scrubs the cognito authorizer
   * @param record {Error}
   * @returns {Error}
   */
  interim_desc(record) {
    let result = record;
    if (record) {
      result = pii.scrubWhitelist(record, 'requestContext.authorizer.claims', WHITELIST_ATTRS, 1);
    }

    return result;
  },
};
