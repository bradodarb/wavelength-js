const { isObject } = require('lodash');

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
    body: isObject(body) ? JSON.stringify(body) : body,
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


const respond = (state) => {
  const {
    status, response: body, responseCode: code, addCors,
  } = state;
  return getStandardResponse({
    status, body, code, addCors,
  });
};

const error = (state) => {
  const {
    error: {
      statusCode: status, message, error: errorBody, responseCode: code,
    },
    addCors,
  } = state;
  return getStandardResponse({
    status: status || 500,
    body: {
      message,
      errorBody,
    },
    code,
    addCors,
  });
};


module.exports = {
  respond, error, getStandardResponse, getStandardError,
};
