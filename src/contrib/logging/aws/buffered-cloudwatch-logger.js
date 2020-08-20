const StructLog = require('../../../logging');
const pii = require('../../../utils/pii');

const IGNORED_FIELDS = ['token_use', 'sub', 'locale', 'iat', 'email_verified', 'auth_time', 'aud'];

/**
 * Formats the interim_desc field and scrubs the cognito authorizer
 * @param record {Error}
 * @returns {Error}
 */
const details = (record) => {
  let result = record;
  if (record) {
    result = pii.scrubWhitelist(record, 'requestContext.authorizer.claims', IGNORED_FIELDS, 1);
  }

  return result;
};
class BufferedCloudWatchLogger extends StructLog {
  getLoggerOverrides(options = {}) {
    return {
      bindings: {
        awsLambdaName: options.functionName,
        awsLambdaRequestId: options.awsRequestId,
        functionVersion: options.functionVersion,
      },
      serializers: {
        details,
      },
    };
  }
}


module.exports = { BufferedCloudWatchLogger, serializers: { details } };
