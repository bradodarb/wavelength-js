/** @module errors */
const statusCodes = require('../utils/http-status-codes');
const errorCodes = require('./error-codes');

/**
 * @class
 * Specific error type to signal execution should immediately stop
 */
class CancelExecutionError extends Error {

}

/**
 * @class
 * Base level exception for expected errors
 */
class BaseException extends Error {
  /**
   *
   * @param error {string} Error message
   * @param reason {string} Extended error details
   * @param code {(string|number)} Friendly error code for client lookup
   */
  constructor(error, reason, code) {
    super(error);
    this.error = error;
    this.reason = reason;
    this.code = code;
  }

  /**
   * Generate the standard response format for an error
   * @param context {object} AWS lambda context object
   * @param status {(number|string)} HTTP status code
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context, status) {
    return {
      statusCode: status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: String(this),
        error: {
          path: context.invokedFunctionArn,
          reason: this.reason,
          requestId: context.awsRequestId,
          code: this.code,
        },
      }),
    };
  }
}
/**
 * @class
 * Base level exception for client errors
 * returns 400 BAD_REQUEST by default
 */
class Base4xxException extends BaseException {
  //
  // 400 BAD_REQUEST.
  //
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @param status {(number|string)} HTTP status code (400 BAD_REQUEST by default)
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context, status = statusCodes.BAD_REQUEST) {
    return super.getResponse(context, status);
  }
}

/**
 * @class
 * Base level exception for 401 UNAUTHORIZED errors
 */
class Base401Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.UNAUTHORIZED);
  }
}
/**
 * @class
 * Base level exception for 403 FORBIDDEN errors
 */
class Base403Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.FORBIDDEN);
  }
}
/**
 * @class
 * Base level exception for 404 NOT_FOUND errors
 */
class Base404Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.NOT_FOUND);
  }
}
/**
 * @class
 * Base level exception for 409 CONFLICT errors
 */
class Base409Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.CONFLICT);
  }
}
/**
 * @class
 * Base level exception for 415 UNSUPPORTED_MEDIA_TYPE errors
 */
class Base415Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.UNSUPPORTED_MEDIA_TYPE);
  }
}
/**
 * @class
 * Base level exception for 422 UNPROCESSABLE_ENTITY errors
 */
class Base422Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.UNPROCESSABLE_ENTITY);
  }
}
/**
 * @class
 * Base level exception for 424 FAILED DEPENDENCY errors
 */
class Base424Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.FAILED_DEPENDENCY);
  }
}
/**
 * @class
 * Base level exception for 429 TOO_MANY_REQUESTS errors
 */
class Base429Exception extends Base4xxException {
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context, statusCodes.TOO_MANY_REQUESTS);
  }
}
/**
 * @class
 * Base level exception for system errors
 * returns 500 INTERNAL_SERVER_ERROR by default
 */
class Base5xxException extends BaseException {
  /**
   *
   * @param context {object} AWS lambda context object
   * @param status {(number|string)} HTTP status code (450 INTERNAL_SERVER_ERROR by default)
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context, status = statusCodes.INTERNAL_SERVER_ERROR) {
    return super.getResponse(context, status);
  }
}

module.exports = {
  errorCodes,
  BODBaseException: BaseException,
  Base4xxException,
  Base401Exception,
  Base403Exception,
  Base404Exception,
  Base409Exception,
  Base415Exception,
  Base422Exception,
  Base424Exception,
  Base429Exception,
  Base5xxException,
  CancelExecutionError,
};
