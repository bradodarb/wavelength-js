/** @module errors */
const statusCodes = require('../../../../utils/http-status-codes');
const { BaseException } = require('../../../../errors');
const errorCodes = require('../../../../errors/error-codes');


class BaseHttpException extends BaseException {
  /**
   * Generate the standard response format for an error
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return {
      statusCode: this.status,
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
class Base4xxException extends BaseHttpException {
  //
  // 400 BAD_REQUEST.
  //
  get status() {
    return statusCodes.BAD_REQUEST;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}

/**
 * @class
 * Base level exception for 401 UNAUTHORIZED errors
 */
class Base401Exception extends Base4xxException {
  get status() {
    return statusCodes.UNAUTHORIZED;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 403 FORBIDDEN errors
 */
class Base403Exception extends Base4xxException {
  get status() {
    return statusCodes.FORBIDDEN;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 404 NOT_FOUND errors
 */
class Base404Exception extends Base4xxException {
  get status() {
    return statusCodes.NOT_FOUND;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 409 CONFLICT errors
 */
class Base409Exception extends Base4xxException {
  get status() {
    return statusCodes.CONFLICT;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 415 UNSUPPORTED_MEDIA_TYPE errors
 */
class Base415Exception extends Base4xxException {
  get status() {
    return statusCodes.UNSUPPORTED_MEDIA_TYPE;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 422 UNPROCESSABLE_ENTITY errors
 */
class Base422Exception extends Base4xxException {
  get status() {
    return statusCodes.UNPROCESSABLE_ENTITY;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 424 FAILED DEPENDENCY errors
 */
class Base424Exception extends Base4xxException {
  get status() {
    return statusCodes.FAILED_DEPENDENCY;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for 429 TOO_MANY_REQUESTS errors
 */
class Base429Exception extends Base4xxException {
  get status() {
    return statusCodes.TOO_MANY_REQUESTS;
  }
  /**
   * Get standard response object
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}
/**
 * @class
 * Base level exception for system errors
 * returns 500 INTERNAL_SERVER_ERROR by default
 */
class Base5xxException extends BaseHttpException {
  get status() {
    return statusCodes.INTERNAL_SERVER_ERROR;
  }
  /**
   *
   * @param context {object} AWS lambda context object
   * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
   * "Access-Control-Allow-Credentials": boolean}, body: string}}
   */
  getResponse(context) {
    return super.getResponse(context);
  }
}

module.exports = {
  errorCodes,
  BaseHttpException,
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
};
