/** @module aws-object-utils */

const _ = require('lodash');

/**
 * Retrieves the stage based on a few possible input(s):
 * 1) if stage declared in the event
 * 2) if stage prefixed in the function name in the context.
 * 3) if stage prefixed in the function name as an env variable.
 * @param context
 * @returns {string}
 */
function getStage(context) {
  let tokens = [];
  if (context) {
    tokens = context.functionName.split('-');
  } else {
    const envFunctionName = process.env.AWS_LAMBDA_FUNCTION_NAME || '';
    tokens = envFunctionName.split('-');
  }

  if (tokens.length > 1) {
    return tokens[tokens.length - 2];
  }
  return '';
}

/**
 * Creates the standard response for a lambda return.
 * @param body {(object | string | boolean | number)}a primitive
 * or object to return, do not covert using json dumps before,
 * this will be handled in the log lambda wrapper to enhance return
 * logging by keeping the response as an object until it is returned.
 * @param status {number} standard HTTP status code result,
 * use the standard exception to handle non 200 and 300 results.
 * @param headers {object}, Any additional non CORS header,
 * for CORS header use the add_cors parameter (true by default)
 * @param addCors {boolean} Adds cors headers, default is true (always)
 * @returns {{body: string, headers: *, statusCode: number}}
 */
function getStandardResponse({
  body, status = 200, headers = {}, addCors = true,
} = {}) {
  let cors = {};
  if (addCors) {
    cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
  }
  const responseHeaders = Object.assign({}, headers, cors);

  return {
    body: _.isString(body) ? body : JSON.stringify(body),
    headers: responseHeaders,
    statusCode: status,
  };
}
function getStandardError({
  status = 400, message, reason, requestId, code,
} = {}) {
  return getStandardResponse({
    body: {
      message,
      error: { reason, requestId, code },
    },
    status,
  });
}

/**
 * Converts base application exception to standard output
 * @param err {BODBaseException}
 * @returns {{body: string, headers: *, statusCode: number}}
 */
function getStandardResponseFromError(err) {
  return getStandardResponse({ body: err.getResponse(), status: err.status });
}
module.exports = {
  getStage, getStandardResponse, getStandardError, getStandardResponseFromError,
};
